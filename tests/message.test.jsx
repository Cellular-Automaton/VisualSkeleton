import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import App from '../src/App.jsx';

const mockUpdateCellStates = vi.fn();
const mockGetCellStates = vi.fn(() => [[1]]);
const mockSetFrames = vi.fn();
const mockCreateGrid = vi.fn();
const mockToggleCell = vi.fn();
const mockClearGrid = vi.fn();

vi.mock('../src/hooks/useGrid', () => ({
    useGrid: () => ({
        cells: [],
        rows: 1,
        cols: 1,
        stats: {},
        frames: [],
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
    default: () => <div>PixiRenderer Mock</div>
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

        await waitFor(() => {
            // Check in parameters panel if text fields updated
        });
    });
});