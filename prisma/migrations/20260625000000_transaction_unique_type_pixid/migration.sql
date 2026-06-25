-- Garante idempotência no crédito de prêmios e depósitos:
-- dois requests simultâneos com o mesmo (type, pixId) só criam um registro.
-- NULL em pixId é excluído do índice (permite múltiplos saques sem pixId).
CREATE UNIQUE INDEX "Transaction_type_pixId_key"
  ON "Transaction"("type", "pixId")
  WHERE "pixId" IS NOT NULL;
