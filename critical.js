export function isCriticalHit() {
  return Math.random() < 0.1; // 10% шанс критического удара
}

export function getCriticalDamage(damage) {
  return damage * 2; // Критический урон в 2 раза больше
}