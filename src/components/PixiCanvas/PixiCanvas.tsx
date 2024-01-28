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

    // Function to generate a random color
    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '0x';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return parseInt(color);
    };

    // Function to generate a random speed within a given range
    const getRandomSpeed = (min: number, max: number): number => {
        return Math.random() * (max - min) + min;
    };

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
                transparent: true
            });
            // @ts-ignore
            pixiContainer.current.appendChild(app.current.view);

            // Add your PixiJS content here...

            // Grid settings
            const gridSize = 8; // 8x8 grid
            const squareSize = 50; // Each square is 50x50 pixels
            const padding = 0; // 10 pixels padding between squares
            const minSpeed = 0.005; // Minimum alpha change per frame
            const maxSpeed = 0.02; // Maximum alpha change per frame

            // Function to create a square divided into four triangles
            const createDividedSquare = (size: number, color: number) => {
                const container = new PIXI.Container();
                const halfSize = size / 2;

                // Define the points for the triangles
                const points = [
                    new PIXI.Point(0, 0),
                    new PIXI.Point(size, 0),
                    new PIXI.Point(size, size),
                    new PIXI.Point(0, size),
                    new PIXI.Point(halfSize, halfSize) // center point
                ];

                // Draw each triangle
                for (let i = 0; i < points.length - 1; i++) {
                    const triangle = new PIXI.Graphics();
                    color = 0xFFFFFF; //getRandomColor(); // TODO - Remove later
                    triangle.beginFill(color);
                    triangle.drawPolygon([
                        points[i].x, points[i].y, // Current corner
                        points[(i + 1) % 4].x, points[(i + 1) % 4].y, // Next corner
                        points[4].x, points[4].y, // Center point
                    ]);
                    triangle.endFill();
                    triangle.animationData = {
                        alpha: 1,
                        delta: getRandomSpeed(minSpeed, maxSpeed) * (Math.random() < 0.5 ? -1 : 1),
                        delay: Math.random() * 60, // Random delay up to 60 frames
                        delayCounter: 0,
                        minSpeed: minSpeed,
                        maxSpeed: maxSpeed,
                      };
                    container.addChild(triangle);
                }

                return container;
            };

            // Create and position divided squares in a grid
            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    const dividedSquare = createDividedSquare(squareSize, 0x00ff00);
                    dividedSquare.x = j * (squareSize + padding);
                    dividedSquare.y = i * (squareSize + padding);
                    app.current.stage.addChild(dividedSquare);
                }
            }

            // Animation loop for fading triangles
            app.current.ticker.add(() => {
                app.current?.stage.children.forEach((container: PIXI.Container) => {
                    container.children.forEach((triangle: AnimatedGraphics) => {
                        const data = triangle.animationData;
                        // Handle the delay before starting animation
                        if (data.delayCounter < data.delay) {
                            data.delayCounter++;
                            return;
                        }
                
                        // Animate alpha
                        data.alpha += data.delta;
                        // Randomly decide to change the direction and reset delay
                        if (data.alpha <= 0) {
                            data.alpha = 0;
                            data.delta = getRandomSpeed(data.minSpeed, data.maxSpeed);
                            data.delay = Math.random() * 60; // Random delay up to 60 frames
                            data.delayCounter = 0;
                        } else if (data.alpha >= 1) {
                            data.alpha = 1;
                            data.delta = -getRandomSpeed(data.minSpeed, data.maxSpeed);
                            data.delay = Math.random() * 60; // Random delay up to 60 frames
                            data.delayCounter = 0;
                        }
                        triangle.alpha = data.alpha;
                    });
                });
            });
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
