const { Router } = require('express');
const ProductManager = require('../ProductManager.js');

const router = Router();

// Endpoint para obtener todos los productos o un limite de ellos:
router.get('/', async (req, res) => {
    const limit = req.query.limit;
    try {
        const productManager = new ProductManager('./files/products.json');
        await productManager.readJson();
        const products = productManager.products;
        if (limit) {
            res.json(products.slice(0, limit));
        } else {
            res.json(products);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los productos');
    }
});

// Endpoint para btener producto por id:
router.get('/:pid', async (req, res) => {
    const pid = req.params.pid;
    try {
        const productManager = new ProductManager('./files/products.json');
        await productManager.readJson();
        const products = productManager.products;
        const product = products.find((product) => product.id == pid);
        if (product) {
            res.json(product);
        } else {
            res.send(`El producto con id ${pid} no existe.`);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al obtener los productos');
    }
});

// Endpoint para agregar un producto:
router.post('/', async (req, res) => {
    try {
        const productManager = new ProductManager('./files/products.json');
        await productManager.readJson();
        const products = productManager.products;

        const { title, description, code, price, stock, category, thumbnails } = req.body;

        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).send('Oops! Faltan campos obligatorios');
        }

        const newProduct = {
            id: products.length + 1,
            title,
            description,
            code,
            price,
            status: true,
            stock,
            category,
            thumbnails: thumbnails || [],
        };

        products.push(newProduct);

        await productManager.writeJson(products);

        res.json(newProduct);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al agregar el producto');
    }
});

// Endpoint para actualizar un producto:
router.put('/:pid', async (req, res) => {
    const pid = req.params.pid;
    try {
        const productManager = new ProductManager('./files/products.json');
        await productManager.readJson();
        const products = productManager.products;

        const productIndex = products.findIndex((product) => product.id == pid);

        if (productIndex < 0) {
            return res.status(404).send(`Oh oh... El producto con id ${pid} no existe.`);
        }

        const { id, ...updates } = req.body;

        if (Object.keys(updates).length === 0) {
            return res.status(400).send('No se proporcionaron campos a actualizar');
        }

        if (id && id != pid) {
            return res.status(400).send('No se permite actualizar el ID del producto');
        }

        products[productIndex] = { ...products[productIndex], ...updates };

        await productManager.writeJson(products);

        res.json(products[productIndex]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar el producto');
    }
});

// Endpoint para cambiar el status del producto a false (eliminar producto):
router.delete('/:pid', async (req, res) => {
    const pid = req.params.pid;
    try {
        const productManager = new ProductManager('./files/products.json');
        await productManager.readJson();
        const products = productManager.products;

        const productIndex = products.findIndex((product) => product.id == pid);

        if (productIndex < 0) {
            return res.status(404).send(`El producto con id ${pid} no existe.`);
        }

        products[productIndex].status = false;

        await productManager.writeJson(products);

        res.send(`El producto con id ${pid} ha sido eliminado.`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar el producto');
    }
});

module.exports = router;