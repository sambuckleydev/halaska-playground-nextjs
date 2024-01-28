"use client";

import PixiCanvas from "@/components/PixiCanvas/PixiCanvas";
import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles.main}>
      <PixiCanvas />
    </main>
  );
}
