// ============================================
// Validador de mazos (reglas oficiales FW)
// ============================================

const DECK_RULES = {
  MAIN_DECK_SIZE: 50,       // exactamente 50 cartas (sin contar líder)
  MAX_COPIES: 4,            // máximo 4 copias de la misma carta
  LEADER_REQUIRED: true,    // 1 líder obligatorio
};

/**
 * Valida un mazo según las reglas oficiales de Fusion World
 * @param {object} leader - carta líder { id, card_type, color }
 * @param {array} cards - [{ id, card_type, color, quantity }]
 * @returns {{ isValid, errors }}
 */
const validateDeck = (leader, cards) => {
  const errors = [];

  // 1. Debe tener líder
  if (!leader) {
    errors.push('El mazo necesita una carta LEADER.');
  } else if (leader.card_type !== 'LEADER') {
    errors.push(`La carta ${leader.id} no es de tipo LEADER.`);
  }

  // 2. Verificar total de cartas = 50
  const totalCards = cards.reduce((sum, c) => sum + c.quantity, 0);
  if (totalCards !== DECK_RULES.MAIN_DECK_SIZE) {
    errors.push(
      `El mazo debe tener exactamente ${DECK_RULES.MAIN_DECK_SIZE} cartas. ` +
      `Actualmente tiene ${totalCards}.`
    );
  }

  // 3. Máximo 4 copias por carta
  for (const card of cards) {
    if (card.quantity > DECK_RULES.MAX_COPIES) {
      errors.push(
        `La carta ${card.id} tiene ${card.quantity} copias. ` +
        `Máximo permitido: ${DECK_RULES.MAX_COPIES}.`
      );
    }
  }

  // 4. No incluir cartas tipo LEADER en el mazo principal
  const leadersInDeck = cards.filter(c => c.card_type === 'LEADER');
  if (leadersInDeck.length > 0) {
    errors.push(
      'No se pueden incluir cartas LEADER en el mazo principal. ' +
      'El líder se define aparte.'
    );
  }

  // 5. Solo cartas del mismo color que el líder (o sin color)
  if (leader) {
    const invalidColor = cards.filter(
      c => c.color && c.color !== leader.color && c.card_type !== 'ENERGY MARKER'
    );
    if (invalidColor.length > 0) {
      const names = invalidColor.map(c => `${c.id} (${c.color})`).join(', ');
      errors.push(
        `Las siguientes cartas no coinciden con el color del líder (${leader.color}): ${names}`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = { validateDeck, DECK_RULES };
