"use client";

import styles from "./PixiCanvas.module.scss";
import React, { useRef, useEffect, useState } from 'react';
import * as PIXI from 'pixi.js';

interface ContainerSize {
  width?: number;
  height?: number;
}

const PixiCanvas: React.FC = () => {
    const pixiContainer = useRef<HTMLDivElement>(null);
    const app = useRef<PIXI.Application | null>(null);
    const [containerSize, setContainerSize] = useState<ContainerSize>({ width: 800, height: 600 });

    useEffect(() => {
        const handleResize = (entries: ResizeObserverEntry[]) => {
            const entry = entries[0];
            if (entry && entry.contentRect) {
                setContainerSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });

                if (app.current) {
                    app.current.renderer.resize(entry.contentRect.width, entry.contentRect.height);
                }
            }
        };

        let observer: ResizeObserver;
        if (pixiContainer.current) {
            observer = new ResizeObserver(handleResize);
            observer.observe(pixiContainer.current);

            app.current = new PIXI.Application<HTMLCanvasElement>({ 
                width: containerSize.width, 
                height: containerSize.height,
                backgroundColor: 0x1099bb
            });
            // @ts-ignore
            pixiContainer.current.appendChild(app.current.view);

            // Add your PixiJS content here...
            
            // Grid settings
            const gridSize = 8; // 8x8 grid
            const squareSize = 50; // Each square is 50x50 pixels
            const squareColor = 0x00ff00; // Green color for squares
            const padding = 10; // 10 pixels padding between squares

            // Function to create a square
            const createSquare = (size: number, color: number) => {
                const square = new PIXI.Graphics();
                square.beginFill(color);
                square.drawRect(0, 0, size, size);
                square.endFill();
                return square;
            };

            // Create and position squares in a grid
            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    const square = createSquare(squareSize, squareColor);
                    square.x = j * (squareSize + padding);
                    square.y = i * (squareSize + padding);
                    app.current.stage.addChild(square);
                }
            }
        }

        return () => {
            if (observer && pixiContainer.current) {
                observer.unobserve(pixiContainer.current);
            }
            if (app.current) {
                app.current.destroy(true, true);
            }
        };
    }, []);

    useEffect(() => {
        if (app.current) {
            app.current.renderer.resize(containerSize.width, containerSize.height);
        }
    }, [containerSize]);

    return <div ref={pixiContainer} className={styles.pixiCanvasContainer} />;
};

export default PixiCanvas;
