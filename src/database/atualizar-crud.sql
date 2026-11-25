-- Selecione a base do Autosample no MySQL Workbench antes de rodar.
DELIMITER $$
DROP PROCEDURE IF EXISTS atualizar_autosample_crud$$
CREATE PROCEDURE atualizar_autosample_crud()
BEGIN
    IF EXISTS (SELECT nome FROM emocao GROUP BY nome HAVING COUNT(*) > 1) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Existem emoções repetidas. Revise seus vínculos antes de atualizar.';
    END IF;

    IF EXISTS (SELECT posicao FROM top_referencias GROUP BY posicao HAVING COUNT(*) > 1)
       OR EXISTS (SELECT posicao FROM top_albuns GROUP BY posicao HAVING COUNT(*) > 1) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Existem posições repetidas no Top 5. Ajuste as listas antes de atualizar.';
    END IF;

    ALTER TABLE usuario ALTER COLUMN perfil SET DEFAULT 'visitante';

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'emocao' AND INDEX_NAME = 'uk_emocao_nome'
    ) THEN
        ALTER TABLE emocao ADD CONSTRAINT uk_emocao_nome UNIQUE (nome);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'top_referencias' AND INDEX_NAME = 'uk_referencias_posicao'
    ) THEN
        ALTER TABLE top_referencias ADD CONSTRAINT uk_referencias_posicao UNIQUE (posicao);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'top_albuns' AND INDEX_NAME = 'uk_albuns_posicao'
    ) THEN
        ALTER TABLE top_albuns ADD CONSTRAINT uk_albuns_posicao UNIQUE (posicao);
    END IF;

    INSERT IGNORE INTO emocao (nome)
    VALUES ('amor'), ('saudade'), ('verdade'), ('tristeza'), ('alegria'), ('realizacao'), ('orgulho');
END$$
CALL atualizar_autosample_crud()$$
DROP PROCEDURE atualizar_autosample_crud$$
DELIMITER ;
