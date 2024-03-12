export const moveItem = <T>(items: T[], currentIndex: number, newIndex: number): void => {
    if (currentIndex < 0 || currentIndex >= items.length || newIndex < 0 || newIndex >= items.length) {
        return;
    }
    [items[currentIndex], items[newIndex]] = [items[newIndex], items[currentIndex]];
};
