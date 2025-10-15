import express from 'express';
import { query } from '../db/index.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticateToken);

// Получить все тендеры
router.get('/', async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'SELECT * FROM tenders ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения тендеров:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить тендер по ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM tenders WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тендер не найден' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка получения тендера:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать тендер
router.post('/', async (req: AuthRequest, res) => {
  try {
    const {
      name,
      url,
      status,
      publication_date,
      submission_deadline,
      submission_date,
      initial_price,
      my_submission_price,
      winner_price,
      contract_security_percent,
    } = req.body;

    const result = await query(
      `INSERT INTO tenders (
        name, url, status, publication_date, submission_deadline, submission_date,
        initial_price, my_submission_price, winner_price, contract_security_percent, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        name,
        url,
        status || 'Новый',
        publication_date,
        submission_deadline || null,
        submission_date || null,
        initial_price,
        my_submission_price || null,
        winner_price || null,
        contract_security_percent || 0,
        req.user!.userId,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка создания тендера:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить тендер
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      url,
      status,
      publication_date,
      submission_deadline,
      submission_date,
      initial_price,
      my_submission_price,
      winner_price,
      contract_security_percent,
    } = req.body;

    const result = await query(
      `UPDATE tenders SET
        name = COALESCE($1, name),
        url = COALESCE($2, url),
        status = COALESCE($3, status),
        publication_date = COALESCE($4, publication_date),
        submission_deadline = $5,
        submission_date = $6,
        initial_price = COALESCE($7, initial_price),
        my_submission_price = $8,
        winner_price = $9,
        contract_security_percent = COALESCE($10, contract_security_percent)
      WHERE id = $11
      RETURNING *`,
      [
        name,
        url,
        status,
        publication_date,
        submission_deadline,
        submission_date,
        initial_price,
        my_submission_price,
        winner_price,
        contract_security_percent,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тендер не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка обновления тендера:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить тендер
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM tenders WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тендер не найден' });
    }

    res.json({ message: 'Тендер успешно удален' });
  } catch (error) {
    console.error('Ошибка удаления тендера:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
