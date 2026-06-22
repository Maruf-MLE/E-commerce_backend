const db = require('./db');

const createOrder = async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const { address, phone, payment_method = 'COD' } = req.body;
        const userId = req.user.id;

        // Get Cart for user
        const cartRes = await client.query('SELECT id FROM store_cart WHERE user_id = $1', [userId]);

        let cartId;
        if (cartRes.rows.length === 0) {
            // In Django, get_or_create creates it and then it checks if it exists and items exist.
            // If empty, items definitely do not exist, so we can just return empty cart.
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Cart is empty' });
        } else {
            cartId = cartRes.rows[0].id;
        }

        // Get Cart items and join with Product to get the latest price
        const itemsRes = await client.query(`
            SELECT ci.id, ci.quantity, p.price, p.id as product_id
            FROM store_cartitem ci
            JOIN store_product p ON ci.product_id = p.id
            WHERE ci.cart_id = $1
        `, [cartId]);

        if (itemsRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Calculate total
        let total = 0;
        for (let item of itemsRes.rows) {
            total += parseFloat(item.price) * item.quantity;
        }

        // Create Order
        const orderInsertRes = await client.query(`
            INSERT INTO store_order (user_id, total_amount, address, phone, payment_method, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING id
        `, [userId, total, address, phone, payment_method]);

        const orderId = orderInsertRes.rows[0].id;

        // Create OrderItems
        for (let item of itemsRes.rows) {
            await client.query(`
                INSERT INTO store_orderitem (order_id, product_id, quantity, price)
                VALUES ($1, $2, $3, $4)
            `, [orderId, item.product_id, item.quantity, item.price]);
        }

        // Clear CartItems
        await client.query('DELETE FROM store_cartitem WHERE cart_id = $1', [cartId]);

        await client.query('COMMIT');

        return res.json({
            message: 'Order placed successfully',
            order_id: orderId
        });

    } catch (error) {
        await client.query('ROLLBACK');
        return res.status(500).json({ error: error.message || String(error) });
    } finally {
        client.release();
    }
};

module.exports = {
    createOrder,
};
