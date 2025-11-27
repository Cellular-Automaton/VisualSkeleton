import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PixiRenderer from '../src/components/PixiRenderer';

const mockOn = vi.fn();

const mockAddChild = vi.fn();

const mockPlugins = {
    pause: vi.fn(),
    resume: vi.fn(),
};

const mockViewportInstance = {
    drag: vi.fn().mockReturnThis(),
    pinch: vi.fn().mockReturnThis(),
    wheel: vi.fn().mockReturnThis(),
    decelerate: vi.fn().mockReturnThis(),
    clampZoom: vi.fn(),
    addChild: mockAddChild,
    setZoom: vi.fn(),
    resize: vi.fn(),
    moveCenter: vi.fn(),
    plugins: mockPlugins,
};

const mockApp = {
    stage: { 
        interactive: false, 
        addChild: vi.fn()
    },
    renderer: { events: {} },
    canvas: document.createElement('canvas'),
    init: vi.fn().mockResolvedValue(),
    destroy: vi.fn(),
};

vi.mock('pixi.js', () => {
    function Application() { // <= vraie fonction, pas arrow
        return mockApp;
    }

    function Container() {
        return { addChild: mockAddChild };
    }

    function Graphics() {
        return graphicsInstance;
    }

    return {
        Application,
        Container,
        Graphics,
    };
});

vi.mock('pixi-viewport', () => {
    function Viewport() {
        return mockViewportInstance;
    }

    return { Viewport };
});

const graphicsInstance = {
    rect: vi.fn().mockReturnThis(),
    fill: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    on: mockOn,
    alpha: 1,
    interactive: false,
    buttonMode: false,
    x: 0,
    y: 0,
}

describe('PixiRenderer', () => {
    beforeEach(() => {
        mockOn.mockClear();
        mockAddChild.mockClear();
        mockPlugins.pause.mockClear();
        mockPlugins.resume.mockClear();
        mockApp.init.mockClear();
    });

    it('Render a 2x2 table', async () => {
        const cellsInitial = [
            { id: 'cell-0-0', col: 0, row: 0, state: 0 },
            { id: 'cell-0-1', col: 0, row: 1, state: 1 },
            { id: 'cell-1-0', col: 1, row: 0, state: 0 },
            { id: 'cell-1-1', col: 1, row: 1, state: 1 },
        ]
        const renderer = render(<PixiRenderer cells={cellsInitial} rows={2} cols={2} onCellClick={vi.fn()} />);

        await act(async () => {
            await Promise.resolve();
        });

        expect(mockAddChild).toHaveBeenCalledTimes(5); // 4 cells + viewport
    });

    it('Render a 10x10 table', async () => {
        const cellsInitial = []
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
                cellsInitial.push({ id: `cell-${r}-${c}`, col: c, row: r, state: 0 });
            }
        }
        const renderer = render(<PixiRenderer cells={cellsInitial} rows={10} cols={10} onCellClick={vi.fn()} />);

        await act(async () => {
            await Promise.resolve();
        });

        expect(mockAddChild).toHaveBeenCalledTimes(101); // 100 cells + viewport
    });

    it('Click on a cell triggers onCellClick', async () => {
        const cellsInitial = [
            { id: 'cell-0-0', col: 0, row: 0, state: 0 },
            { id: 'cell-0-1', col: 0, row: 1, state: 1 },
        ]
        const mockOnCellClick = vi.fn();
        const renderer = render(<PixiRenderer cells={cellsInitial} rows={1} cols={2} onCellClick={mockOnCellClick} />);

        await act(async () => {
            await Promise.resolve();
        });

        // Simulate click on first cell
        const pointerDownCallback = mockOn.mock.calls.find(call => call[0] === 'pointerdown')[1];
        act(() => {
            pointerDownCallback();
        });
        expect(mockOnCellClick).toHaveBeenCalledWith('cell-0-0');
    });

    it('Dragging over cells triggers onCellClick for each cell', async () => {
        const cellsInitial = [
            { id: 'cell-0-0', col: 0, row: 0, state: 0 },
            { id: 'cell-0-1', col: 0, row: 1, state: 1 },
            { id: 'cell-1-0', col: 1, row: 0, state: 0 },
            { id: 'cell-1-1', col: 1, row: 1, state: 1 },
        ]
        const mockOnCellClick = vi.fn();
        const renderer = render(<PixiRenderer cells={cellsInitial} rows={2} cols={2} onCellClick={mockOnCellClick} />);
        await act(async () => {
            await Promise.resolve();
        });

        // Simulate drag over all cells
        const pointerDownCallbacks = mockOn.mock.calls
            .filter(call => call[0] === 'pointerdown')
            .map(call => call[1]);

        act(() => {
            pointerDownCallbacks.forEach(callback => callback());
        });

        expect(mockOnCellClick).toHaveBeenCalledTimes(4);
        expect(mockOnCellClick).toHaveBeenCalledWith('cell-0-0');
        expect(mockOnCellClick).toHaveBeenCalledWith('cell-0-1');
        expect(mockOnCellClick).toHaveBeenCalledWith('cell-1-0');
        expect(mockOnCellClick).toHaveBeenCalledWith('cell-1-1');
    });

    it('Dragging over the same cell only triggers onCellClick once per cell', async () => {
        const cellsInitial = [
            { id: 'cell-0-0', col: 0, row: 0, state: 0 },
            { id: 'cell-0-1', col: 0, row: 1, state: 1 },
        ]
        const mockOnCellClick = vi.fn();
        const renderer = render(<PixiRenderer cells={cellsInitial} rows={1} cols={2} onCellClick={mockOnCellClick} />);
        await act(async () => {
            await Promise.resolve();
        });

        // Simulate drag over the first cell twice
        const pointerDownCallback = mockOn.mock.calls.find(call => call[0] === 'pointerdown')[1];
        act(() => {
            pointerDownCallback();
            pointerDownCallback();
        });
        expect(mockOnCellClick).toHaveBeenCalledTimes(1);
        expect(mockOnCellClick).toHaveBeenCalledWith('cell-0-0');
    });

    it('Overing a cell then alpha reduce to indicate that it is selected', async() => {
        const cellsInitial = [
            { id: 'cell-0-0', col: 0, row: 0, state: 0 },
        ]
        const renderer = render(<PixiRenderer cells={cellsInitial} rows={1} cols={1} onCellClick={vi.fn()} />);
        await act(async () => {
            await Promise.resolve();
        });

        const pointerOverHandler = mockOn.mock.calls.find(([event]) => event === 'pointerover')[1];
        
        expect(graphicsInstance.alpha).toBe(1.0);
        act(() => {
            pointerOverHandler();
        });
        expect(graphicsInstance.alpha).toBe(0.7);

        expect()
    });

    it('Resizing the window triggers viewport resize', async () => {
        const cellsInitial = [
            { id: 'cell-0-0', col: 0, row: 0, state: 0 },
        ]

        const renderer = render(<PixiRenderer cells={cellsInitial} rows={1} cols={1} onCellClick={vi.fn()} />);
        await act(async () => {
            await Promise.resolve();
        });

        act(() => {
            window.dispatchEvent(new Event('resize'));
        });

        expect(mockViewportInstance.resize).toHaveBeenCalledWith(window.innerWidth, window.innerHeight, 110, 110);
        expect(mockViewportInstance.moveCenter).toHaveBeenCalledWith(55, 55);
    });

    it('Releasing mouse button stops dragging and resumes viewport plugins', async () => {
        const cellsInitial = [
            { id: 'cell-0-0', col: 0, row: 0, state: 0 },
        ]
        const renderer = render(<PixiRenderer cells={cellsInitial} rows={1} cols={1} onCellClick={vi.fn()} />);
        await act(async () => {
            await Promise.resolve();
        });

        act(() => {
            window.dispatchEvent(new MouseEvent('mouseup'));
        });

        expect(mockPlugins.resume).toHaveBeenCalledWith("drag");
        expect(mockPlugins.resume).toHaveBeenCalledWith("pinch");
        expect(mockPlugins.resume).toHaveBeenCalledWith("wheel");

    });

    it('Long press on a cell activates dragging mode and pauses viewport plugins', async () => {
        const cellsInitial = [
            { id: 'cell-0-0', col: 0, row: 0, state: 0 },
        ]
        const renderer = render(<PixiRenderer cells={cellsInitial} rows={1} cols={1} onCellClick={vi.fn()} />);
        await act(async () => {
            await Promise.resolve();
        });

        act(() => {
            const pointerDownCallback = mockOn.mock.calls.find(call => call[0] === 'pointerdown')[1];
            pointerDownCallback();
        });

        expect(mockPlugins.pause).toHaveBeenCalledWith("drag");
        expect(mockPlugins.pause).toHaveBeenCalledWith("pinch");
        expect(mockPlugins.pause).toHaveBeenCalledWith("wheel");
    });
});