import { useRef, useEffect, useState } from 'react';
import { Application, Container, Graphics } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

const PixiRenderer = ({ cells, rows, cols, onCellClick }) => {
    const appRef = useRef(null);
    const containerRef = useRef(null);
    const viewportRef = useRef(null);
    const [isPixiReady, setIsPixiReady] = useState(false);
    const dragInfoRef = useRef({
        active: false,
        alreadyDoneCells: new Set()
    });
    const cellGraphicsRef = useRef(new Map()); // Map pour stocker chaque cellule PIXI

    useEffect(() => {
        initPixi();

        return () => {
            if (appRef.current) {
                const pixiContainer = document.getElementById('pixi-container');
                if (pixiContainer && appRef.current.canvas) {
                    pixiContainer.removeChild(appRef.current.canvas);
                }
                appRef.current.destroy();
            }
        };
    }, []);

    useEffect(() => {
        if (!isPixiReady)
            return;

        createTableGraphics();
    }, [cells, isPixiReady]);


    const createTableGraphics = () => {
        if (!containerRef.current)
            return;

        cellGraphicsRef.current.forEach(graphic => {
            containerRef.current.removeChild(graphic);
            graphic.destroy();
        });
        cellGraphicsRef.current.clear();

        cells.forEach(cell => {
            createCellGraphics(cell);
        });
    }

    const initPixi = async () => {
        const app = new Application();
        const container = new Container();

        app.stage.interactive = true;
        appRef.current = app;

        await app.init({
            background: 0x574536,
            resizeTo: window,
        });

        const pixiContainer = document.getElementById('pixi-container');
        if (pixiContainer) {
            pixiContainer.appendChild(app.canvas);
        }

        const viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: 1000,
            worldHeight: 1000,
            events: app.renderer.events,
        });

        viewport.clampZoom({
            minScale: 0.05,
            maxScale: 3
        });

        app.stage.addChild(viewport);

        viewport.drag().pinch().wheel().decelerate();

        containerRef.current = container;
        viewportRef.current = viewport;
        viewport.addChild(container);

        viewport.setZoom(1);

        window.addEventListener('resize', () => {
            viewport.resize(window.innerWidth, window.innerHeight, cols * 110, rows * 110);
            viewport.moveCenter((cols * 110) / 2, (rows * 110) / 2);
        });
        viewport.moveCenter((cols * 110) / 2, (rows * 110) / 2);

        window.addEventListener('mouseup', (e) => {
            dragInfoRef.current.active = false;
            dragInfoRef.current.alreadyDoneCells.clear();
            viewportRef.current.plugins.resume("drag");
            viewportRef.current.plugins.resume("pinch");
            viewportRef.current.plugins.resume("wheel");
        });

        setIsPixiReady(true);
    };

    const createCellGraphics = (cell) => {
        const graphics = cellGraphicsRef.current.get(cell.id);
        if (graphics) 
            return graphics;

        const cellSize = 100;
        const newGraphics = new Graphics();

        newGraphics.rect(0, 0, cellSize, cellSize);
        newGraphics.fill(cell.state === 1 ? 0x235754 : 0xF7e);
        newGraphics.interactive = true;
        newGraphics.buttonMode = true;
        newGraphics.x = cell.row * (cellSize + 10);
        newGraphics.y = cell.col * (cellSize + 10);

        newGraphics.on('pointerdown', () => {
            dragInfoRef.current.active = true;
            if (onCellClick) {
                onCellClick(cell.id);
                dragInfoRef.current.alreadyDoneCells.add(cell.id);
                viewportRef.current.plugins.pause("drag");
                viewportRef.current.plugins.pause("pinch");
                viewportRef.current.plugins.pause("wheel");
            }
        });
        newGraphics.on('pointerover', () => {
            newGraphics.alpha = 0.7;
            if (dragInfoRef.current.active && !dragInfoRef.current.alreadyDoneCells.has(cell.id)) {
                onCellClick(cell.id);
                dragInfoRef.current.alreadyDoneCells.add(cell.id);
            }
        });
        newGraphics.on('pointerout', () => {
            newGraphics.alpha = 1.0;
        });

        cellGraphicsRef.current.set(cell.id, newGraphics);
        containerRef.current.addChild(newGraphics);
        return;
    }

    return (
        <div id="pixi-container" className="w-full h-full">
        </div>
    );
};

export default PixiRenderer;