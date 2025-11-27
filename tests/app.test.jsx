import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import App from '../src/App.jsx';

const mockUpdateCellStates = vi.fn();
const mockGetCellStates = vi.fn(() => [
    0, 1,
    0, 1
]);
const mockSetFrames = vi.fn();
const mockCreateGrid = vi.fn();
const mockToggleCell = vi.fn();
const mockClearGrid = vi.fn();

let mockCells = [];
let mockFrames = [];

vi.mock('../src/hooks/useGrid', () => ({
    useGrid: () => ({
        cells: mockCells,
        rows: 1,
        cols: 1,
        stats: {},
        frames: mockFrames,
        createGrid: mockCreateGrid,
        toggleCell: mockToggleCell,
        getAllStates: () => [],
        clearGrid: mockClearGrid,
        getCellStates: mockGetCellStates,
        updateCellStates: mockUpdateCellStates,
        setFrames: mockSetFrames
    })
}));

vi.mock('../src/components/PixiRenderer', () => ({
    default: ({ onCellClick }) => (
        <button
            data-testid="mock-cell"
            onClick={onCellClick('1-1')}
        >
            Mock PixiRenderer
        </button>
    )
}));

describe('App messaging via window.electronAPI (Receive)', () => {
    beforeEach(() => {
        window.electronAPI = { sendToHost: vi.fn() };
        vi.clearAllMocks();
    });

    it('Should update the grid when receiving UPDATE_TABLE message', async () => {
        render(<App />);
        const messageEvent = new MessageEvent('message', {
            data: {
                action: 'UPDATE_TABLE',
                data: { 
                    table: [[1, 0, 0, 1]] 
                }
            }
        });

        act(() => {
            window.dispatchEvent(messageEvent);
        });

        await waitFor(() => {
            expect(mockUpdateCellStates).toHaveBeenCalledWith([[1, 0, 0, 1]]);
            expect(mockSetFrames).toHaveBeenCalled();
        });
    });

    it('Should update the grid when receiving UPDATE_TABLE message with a bigger table', async () => {
        render(<App />);
        const messageEvent = new MessageEvent('message', {
            data: {
                action: 'UPDATE_TABLE',
                data: { 
                    table: [
                        1, 0, 0, 1, 1, 0, 0, 0, 1, 0,
                        0, 1, 0, 1, 0, 0, 1, 0, 1, 0,
                        1, 1, 0, 0, 0, 1, 1, 0, 0, 1,
                        0, 0, 1, 0, 1, 0, 0, 1, 0, 0,
                        1, 0, 1, 1, 0, 1, 0, 1, 1, 0
                    ] 
                }
            }
        });

        act(() => {
            window.dispatchEvent(messageEvent);
        });

        await waitFor(() => {
            expect(mockUpdateCellStates).toHaveBeenCalledWith([
                1, 0, 0, 1, 1, 0, 0, 0, 1, 0,
                0, 1, 0, 1, 0, 0, 1, 0, 1, 0,
                1, 1, 0, 0, 0, 1, 1, 0, 0, 1,
                0, 0, 1, 0, 1, 0, 0, 1, 0, 0,
                1, 0, 1, 1, 0, 1, 0, 1, 1, 0
            ]);
            expect(mockSetFrames).toHaveBeenCalled();
        });
    });

    it('Should update parameters when receiving PARAMETERS message', async () => {
        render(<App />);
        const messageEvent = new MessageEvent('message', {
            data: {
                action: 'PARAMETERS',
                data: {
                    parameters: { 
                        width: 20, 
                        height: 20 
                    }
                }
            }
        });

        act(() => {
            window.dispatchEvent(messageEvent);
        });

        // Must be like this because they are MUI TextFields
        const widthField = screen.getByTestId('param-width');
        const widthInput = widthField.querySelector('input');
        const heightField = screen.getByTestId('param-height');
        const heightInput = heightField.querySelector('input');
        
        expect(widthInput.value).toBe('20');
        expect(heightInput.value).toBe('20');
    });

    it('Should update parameters when receiving PARAMETERS message with a lot of parameters', async () => {
        render(<App />);
        const messageEvent = new MessageEvent('message', {
            data: {
                action: 'PARAMETERS',
                data: {
                    parameters: { 
                        width: 100,
                        height: 57,
                        speed: 5,
                        density: 10,
                        randomness: 15,
                        cellSize: 8,
                        gridLineWidth: 1
                    }
                }
            }
        });

        act(() => {
            window.dispatchEvent(messageEvent);
        });

        const widthField = screen.getByTestId('param-width');
        const widthInput = widthField.querySelector('input');
        const heightField = screen.getByTestId('param-height');
        const heightInput = heightField.querySelector('input');
        const speedField = screen.getByTestId('param-speed');
        const speedInput = speedField.querySelector('input');
        const densityField = screen.getByTestId('param-density');
        const densityInput = densityField.querySelector('input');
        const randomnessField = screen.getByTestId('param-randomness');
        const randomnessInput = randomnessField.querySelector('input');
        const cellSizeField = screen.getByTestId('param-cellSize');
        const cellSizeInput = cellSizeField.querySelector('input');
        const gridLineWidthField = screen.getByTestId('param-gridLineWidth');
        const gridLineWidthInput = gridLineWidthField.querySelector('input');
        
        expect(widthInput.value).toBe('100');
        expect(heightInput.value).toBe('57');
        expect(speedInput.value).toBe('5');
        expect(densityInput.value).toBe('10');
        expect(randomnessInput.value).toBe('15');
        expect(cellSizeInput.value).toBe('8');
        expect(gridLineWidthInput.value).toBe('1');
    });

    it('Should import data when receiving IMPORTED_DATA message', async () => {
        render(<App />);
        const table = [0, 1, 1, 0];
        mockCells = table;
        const messageEvent = new MessageEvent('message', {
            data: {
                action: 'IMPORTED_DATA',
                data: {
                    table: table,
                    parameters: { 
                        width: 2,
                        height: 2,
                    }
                }
            }
        });

        act(() => {
            window.dispatchEvent(messageEvent);
        });

        await waitFor(() => {
            expect(mockUpdateCellStates).toHaveBeenCalledWith([0, 1, 1, 0]);
            expect(mockSetFrames).toHaveBeenCalled();
        });

        const widthField = screen.getByTestId('param-width');
        const widthInput = widthField.querySelector('input');
        const heightField = screen.getByTestId('param-height');
        const heightInput = heightField.querySelector('input');
        
        expect(widthInput.value).toBe('2');
        expect(heightInput.value).toBe('2');
    });
});

describe('App messaging via window.electronAPI (Send)', () => {
    beforeEach(() => {
        window.electronAPI = { sendToHost: vi.fn() };
        vi.clearAllMocks();
    });

    it('Should send EXPORT message when exporting data', async () => {
        render(<App />);
        const exportButton = screen.getByText('Export Data');
        const table = [
            1, 0, 
            1, 0
        ];
        mockCells = table;
        const messageEvent = new MessageEvent('message', {
            data: {
                action: 'IMPORTED_DATA',
                data: {
                    table: table,
                    parameters: { 
                        width: 2,
                        height: 2,
                    }
                }
            }
        });

        act(() => {
            window.dispatchEvent(messageEvent);
        });
        
        await waitFor(() => {
            // Insure the check of the grid changement has been made
            expect(mockUpdateCellStates).toHaveBeenCalledWith(table);
            expect(mockSetFrames).toHaveBeenCalled();
        });

        fireEvent.click(exportButton);

        await waitFor(() => {
            expect(window.electronAPI.sendToHost).toHaveBeenCalledWith({
                action: 'EXPORT',
                data: {
                    table: [
                        0, 1, 
                        0, 1
                    ],
                    parameters: {
                        width: { 
                            value: 2,
                            type: 'number'
                        },
                        height: { 
                            value: 2,
                            type: 'number'
                        },
                    }
                }
            })
        });
    });

    it('Should send PLAY_SIMULATION message when starting the simulation', async () => {
        render(<App />);
        const playButton = screen.getByText('Play');

        fireEvent.click(playButton);

        await waitFor(() => {
            expect(window.electronAPI.sendToHost).toHaveBeenCalledWith({
                action: 'PLAY_SIMULATION',
                data: {
                    table: [
                        0, 1,
                        0, 1
                    ],
                    parameters: { 
                        width: 10,
                        height: 10
                    }
                }
            });
        });
    });

    it('Should send PAUSE_SIMULATION message when pausing the simulation', async () => {
        render(<App />);
        const playButton = screen.getByText('Play');
        fireEvent.click(playButton);

        await waitFor(() => {
            expect(window.electronAPI.sendToHost).toHaveBeenCalledWith({
                action: 'PLAY_SIMULATION',
                data: {
                    table: [
                        0, 1,
                        0, 1
                    ],
                    parameters: { 
                        width: 10,
                        height: 10
                    }
                }
            });
        });

        const pauseButton = screen.getByText('Pause');
        fireEvent.click(pauseButton);

        await waitFor(() => {
            expect(window.electronAPI.sendToHost).toHaveBeenCalledWith({
                action: 'PAUSE_SIMULATION'
            });
        });
    });

    it('Should send IMPORT message when asking to import data', async () => {
        render(<App />);
        const importButton = screen.getByText('Import Data');
        fireEvent.click(importButton);

        await waitFor(() => {
            expect(window.electronAPI.sendToHost).toHaveBeenCalledWith({
                action: 'IMPORT'
            });
        });
    });
});

describe('Other App functionalities', () => {
    beforeEach(() => {
        window.electronAPI = { sendToHost: vi.fn() };
        vi.clearAllMocks();
    });

    it('Should clear the grid when clicking Clear Grid button', async () => {
        render(<App />);
        const clearButton = screen.getByText('Clear');
        fireEvent.click(clearButton);
        await waitFor(() => {
            expect(mockClearGrid).toHaveBeenCalled();
        });
    });

    it('Should resize the number of field when too low values are inputted', async () => {
        render(<App />);
        const widthField = screen.getByTestId('param-width');
        const widthInput = widthField.querySelector('input');

        const heightField = screen.getByTestId('param-height');
        const heightInput = heightField.querySelector('input');

        fireEvent.change(widthInput, { target: { value: '-5' } });
        fireEvent.change(heightInput, { target: { value: '-5' } });

        await waitFor(() => {
            expect(widthInput.value).toBe('1');
            expect(heightInput.value).toBe('1');
        });
    });

    it('Should resize the number of field when too high values are inputted', async () => {
        render(<App />);
        const widthField = screen.getByTestId('param-width');
        const widthInput = widthField.querySelector('input');

        const heightField = screen.getByTestId('param-height');
        const heightInput = heightField.querySelector('input');

        fireEvent.change(widthInput, { target: { value: '102' } });
        fireEvent.change(heightInput, { target: { value: '230' } });

        await waitFor(() => {
            expect(widthInput.value).toBe('100');
            expect(heightInput.value).toBe('100');
        });
    });

    it('Should update the current frame when moving the slider', async () => {
        render(<App />);
        mockFrames = [[
                0, 0,
                0, 0
            ],[
                1, 1,
                1, 1
            ]
        ];

        // Doing this to update the frames in the hook
        const messageEvent = new MessageEvent('message', {
            data: {
                action: 'UPDATE_TABLE',
                data: { 
                    table: [
                        1, 0,
                        0, 1
                    ] 
                }
            }
        });

        act(() => {
            window.dispatchEvent(messageEvent);
        });

        const frameSlider = screen.getByRole('slider');
        expect(frameSlider).toHaveAttribute('aria-valuenow', '1');
        expect(frameSlider).toHaveAttribute('aria-valuemin', '1');
        expect(frameSlider).toHaveAttribute('aria-valuemax', '2');
        fireEvent.change(frameSlider, { target: { value: 2 } });

        await waitFor(() => {
            expect(frameSlider).toHaveAttribute('aria-valuenow', '2');
        });
    });

    it('Should change cell state when clicking on a cell', async () => {
        render(<App />);
        mockCells = [
            0, 0,
            0, 0
        ];

        const cellButton = screen.getByTestId('mock-cell');
        fireEvent.click(cellButton);

        await waitFor(() => {
            expect(mockToggleCell).toHaveBeenCalledWith('1-1');
        });
    });
});