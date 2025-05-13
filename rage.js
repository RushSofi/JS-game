export function isRageMode(hp) {
  return hp <= 30; // Режим ярости при здоровье <= 30%
}

export function getRageDamage(damage) {
  return damage * 1.5; // Урон увеличен на 50%
}