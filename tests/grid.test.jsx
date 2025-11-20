import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, expect } from "vitest";
import { useGrid } from "../src/hooks/useGrid";

describe("useGrid Hook Initialization", () => {
    describe("Initialization with square grid", () => {
        it("Check initialization of 5 rows and 5 columns", () => {
            const { result } = renderHook(() => useGrid());
            act(() => {
                result.current.createGrid(5, 5);
            });
    
            expect(result.current.rows).toBe(5);
            expect(result.current.cols).toBe(5);
        });
    
        it("Check initialization of 10 rows and 10 columns", () => {
            const { result } = renderHook(() => useGrid());
            act(() => {
                result.current.createGrid(10, 10);
            });
    
            expect(result.current.rows).toBe(10);
            expect(result.current.cols).toBe(10);
        });
    
        it("Check initialization of 100 rows and 100 columns", () => {
            const { result } = renderHook(() => useGrid());
            act(() => {
                result.current.createGrid(100, 100);
            });
    
            expect(result.current.rows).toBe(100);
            expect(result.current.cols).toBe(100);
        });
    });

    describe("Initialization with rectangular grid", () => {
        it("Check initialization of 10 rows and 5 columns", () => {
            const { result } = renderHook(() => useGrid());
            act(() => {
                result.current.createGrid(10, 5);
            });
    
            expect(result.current.rows).toBe(10);
            expect(result.current.cols).toBe(5);
            expect(result.current.cells.length).toBe(10 * 5);
        });

        it("Check initialization of 5 rows and 10 columns", () => {
            const { result } = renderHook(() => useGrid());
            act(() => {
                result.current.createGrid(5, 10);
            });
    
            expect(result.current.rows).toBe(5);
            expect(result.current.cols).toBe(10);
            expect(result.current.cells.length).toBe(5 * 10);
        });

        it("Check initialization of 50 rows and 25 columns", () => {
            const { result } = renderHook(() => useGrid());
            act(() => {
                result.current.createGrid(50, 25);
            });
    
            expect(result.current.rows).toBe(50);
            expect(result.current.cols).toBe(25);
            expect(result.current.cells.length).toBe(50 * 25);
        });
    
        it("Check initialization of 25 rows and 50 columns", () => {
            const { result } = renderHook(() => useGrid());
            act(() => {
                result.current.createGrid(25, 50);
            });
    
            expect(result.current.rows).toBe(25);
            expect(result.current.cols).toBe(50);
            expect(result.current.cells.length).toBe(25 * 50);
        });

        it("Check initialization of 100 rows and 50 columns", () => {
            const { result } = renderHook(() => useGrid());
            act(() => {
                result.current.createGrid(100, 50);
            });
    
            expect(result.current.rows).toBe(100);
            expect(result.current.cols).toBe(50);
            expect(result.current.cells.length).toBe(100 * 50);
        });

        it("Check initialization of 50 rows and 100 columns", () => {
            const { result } = renderHook(() => useGrid());
            act(() => {
                result.current.createGrid(50, 100);
            });
    
            expect(result.current.rows).toBe(50);
            expect(result.current.cols).toBe(100);
            expect(result.current.cells.length).toBe(50 * 100);
        });
    });
});

describe("useGrid Hook Cell Toggling", () => {
    it("Toggle a cell at (2,3) in a 5x5 grid", async () => {
        const { result } = renderHook(() => useGrid());

        act(() => {
            result.current.createGrid(5, 5);
        });

        await waitFor(() => {
            expect(result.current.cells.length).toBe(25);
        });

        act(() => {
            result.current.toggleCell("2-3");
        });
        const cell = result.current.cells.find(c => c.id === "2-3");
        expect(cell).toBeTruthy();
        expect(cell.state).toBe(1);
    });

    it("Toggle a cell at (23, 48) in a 50x50 grid", async () => {
        const { result } = renderHook(() => useGrid());

        act(() => {
            result.current.createGrid(50, 50);
        });

        await waitFor(() => {
            expect(result.current.cells.length).toBe(2500);
        });

        act(() => {
            result.current.toggleCell("23-48");
        });
        const cell = result.current.cells.find(c => c.id === "23-48");
        expect(cell).toBeTruthy();
        expect(cell.state).toBe(1);
    });

    it("Toggle a cell at (20, 99) in a 100x100 grid", async () => {
        const { result } = renderHook(() => useGrid());

        act(() => {
            result.current.createGrid(100, 100);
        });

        await waitFor(() => {
            expect(result.current.cells.length).toBe(10000);
        });

        act(() => {
            result.current.toggleCell("20-99");
        });
        const cell = result.current.cells.find(c => c.id === "20-99");
        expect(cell).toBeTruthy();
        expect(cell.state).toBe(1);
    });

    it("Toggle a cell at (5, 5) in a 10x10 grid then toggle it again", async () => {
        const { result } = renderHook(() => useGrid());

        act(() => {
            result.current.createGrid(10, 10);
        });

        await waitFor(() => {
            expect(result.current.cells.length).toBe(100);
        });

        act(() => {
            result.current.toggleCell("5-5");
        });

        const cell = result.current.cells.find(c => c.id === "5-5");
        expect(cell).toBeTruthy();
        expect(cell.state).toBe(1);

        act(() => {
            result.current.toggleCell("5-5");
        });

        const toggledCell = result.current.cells.find(c => c.id === "5-5");
        expect(toggledCell).toBeTruthy();
        expect(toggledCell.state).toBe(0);
    });
});

describe("useGrid Hook Clear Cell", () => {
    it("Clear all cells in a 10x10 grid after toggling some cells", async () => {
        const { result } = renderHook(() => useGrid());
        const cellsToToggle = ["2-3", "5-5", "7-8"];
        act(() => {
            result.current.createGrid(10, 10);
        });

        await waitFor(() => {
            expect(result.current.cells.length).toBe(10 * 10);
        });

        for (const cellId of cellsToToggle) {
            act(() => {
                result.current.toggleCell(cellId);
            });
        }

        await waitFor(() => {
            cellsToToggle.forEach(cellId => {
                const cell = result.current.cells.find(c => c.id === cellId);
                expect(cell.state).toBe(1);
            });
        });

        // clear the grid
        act(() => {
            result.current.clearGrid();
        });

        await waitFor(() => {
            result.current.cells.forEach(cell => {
                expect(cell.state).toBe(0);
            });
        });
    });

    it("Clear all cells in a 50x50 grid after toggling some cells", async () => {
        const { result } = renderHook(() => useGrid());
        const cellsToToggle = ["1-1", "10-36", "28-2", "20-30", "40-40"];
        act(() => {
            result.current.createGrid(50, 50);
        });

        await waitFor(() => {
            expect(result.current.cells.length).toBe(50 * 50);
        });

        for (const cellId of cellsToToggle) {
            act(() => {
                result.current.toggleCell(cellId);
            });
        }

        await waitFor(() => {
            cellsToToggle.forEach(cellId => {
                const cell = result.current.cells.find(c => c.id === cellId);
                expect(cell.state).toBe(1);
            });
        });

        // clear the grid
        act(() => {
            result.current.clearGrid();
        });

        await waitFor(() => {
            result.current.cells.forEach(cell => {
                expect(cell.state).toBe(0);
            });
        });
    });

    it("Clear all cells in a 100x100 grid after toggling some cells", async () => {
        const { result } = renderHook(() => useGrid());
        const cellsToToggle = ["2-3", "5-5", "7-8", "20-30", "50-50", "75-80", "90-90", "99-99"];
        act(() => {
            result.current.createGrid(100, 100);
        });

        await waitFor(() => {
            expect(result.current.cells.length).toBe(100 * 100);
        });

        for (const cellId of cellsToToggle) {
            act(() => {
                result.current.toggleCell(cellId);
            });
        }

        await waitFor(() => {
            cellsToToggle.forEach(cellId => {
                const cell = result.current.cells.find(c => c.id === cellId);
                expect(cell.state).toBe(1);
            });
        });

        // clear the grid
        act(() => {
            result.current.clearGrid();
        });

        await waitFor(() => {
            result.current.cells.forEach(cell => {
                expect(cell.state).toBe(0);
            });
        });
    });
});

describe("useGrid Hook Cell States", () => {
    it("Get all cell states in a 10x10 grid", async () => {
        const { result } = renderHook(() => useGrid());

        act(() => {
            result.current.createGrid(10, 10);
        });

        await waitFor(() => {
            expect(result.current.cells.length).toBe(10 * 10);
        });

        const states = result.current.getCellStates();
        expect(states.length).toBe(100);

        for (const state of states) {
            expect(state).toBe(0);
        }
    });

    it("Get all cell states in a 50x50 grid", async () => {
        const { result } = renderHook(() => useGrid());

        act(() => {
            result.current.createGrid(50, 50);
        });

        await waitFor(() => {
            expect(result.current.cells.length).toBe(50 * 50);
        });

        const states = result.current.getCellStates();
        expect(states.length).toBe(50 * 50);

        for (const state of states) {
            expect(state).toBe(0);
        }
    });

    it("Get all cell states in a 100x100 grid", async () => {
        const { result } = renderHook(() => useGrid());

        act(() => {
            result.current.createGrid(100, 100);
        });

        await waitFor(() => {
            expect(result.current.cells.length).toBe(100 * 100);
        });

        const states = result.current.getCellStates();
        expect(states.length).toBe(100 * 100);

        for (const state of states) {
            expect(state).toBe(0);
        }
    });
});

describe("useGrid Hook Update Cell States", () => {
    it("Update cell states in a 10x10 grid", async () => {
        const { result } = renderHook(() => useGrid());
        const newStates = Array(100).fill(0).map((_, index) => (index % 2 === 0 ? 1 : 0));

        act(() => {
            result.current.createGrid(10, 10);
        });
        await waitFor(() => {
            expect(result.current.cells.length).toBe(100);
        });

        act(() => {
            result.current.updateCellStates(newStates);
        });
        await waitFor(() => {
            result.current.cells.forEach((cell, index) => {
                expect(cell.state).toBe(newStates[index]);
            });
        });
    });

    it("Update cell states in a 50x50 grid", async () => {
        const { result } = renderHook(() => useGrid());
        const newStates = Array(2500).fill(0).map((_, index) => (index % 5 === 0 ? 1 : 0));

        act(() => {
            result.current.createGrid(50, 50);
        });

        await waitFor(() => {
            expect(result.current.cells.length).toBe(2500);
        });

        act(() => {
            result.current.updateCellStates(newStates);
        });

        await waitFor(() => {
            result.current.cells.forEach((cell, index) => {
                expect(cell.state).toBe(newStates[index]);
            });
        });
    });

    it("Update cell states in a 100x100 grid", async () => {
        const { result } = renderHook(() => useGrid());
        const newStates = Array(10000).fill(0).map((_, index) => (index % 10 === 0 ? 1 : 0)); // Every fifth cell alive

        act(() => {
            result.current.createGrid(100, 100);
        });

        await waitFor(() => {
            expect(result.current.cells.length).toBe(10000);
        });

        act(() => {
            result.current.updateCellStates(newStates);
        });

        await waitFor(() => {
            result.current.cells.forEach((cell, index) => {
                expect(cell.state).toBe(newStates[index]);
            });
        });
    });

    it("Attempt to update cell states with mismatched array length", async () => {
        const { result } = renderHook(() => useGrid());
        const newStates = Array(50).fill(0).map((_, index) => (index % 2 === 0 ? 1 : 0)); // Only 50 states

        act(() => {
            result.current.createGrid(10, 10);
        });

        await waitFor(() => {
            expect(result.current.cells.length).toBe(100);
        });

        act(() => {
            result.current.updateCellStates(newStates);
        });

        await waitFor(() => {
            // Ensure cell lenght remains unchanged
            expect(result.current.cells.length).toBe(100);

            // Ensure no cells were updated
            result.current.cells.forEach((cell) => {
                expect(cell.state).toBe(0);
            });
        });
    });
});