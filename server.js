const fs = require('fs');

let id = 1;
let arrayObj = [];

class Contenedor {
    
    constructor(archive){
        this.archive = archive
    }

    async save(producto){
        try{
            if (await this.getAll() === false){
                producto.id = id;
                arrayObj.push(producto);
                await fs.promises.writeFile(this.archive, JSON.stringify(arrayObj, null, 2));
                console.log('Producto cargado correctamente.');
            }else{
                const data = await this.getAll();
                if (data.length === 0){
                    producto.id = id;
                }else{
                    let lastItem = data[data.length - 1];
                    if (lastItem.id >= 1){
                        producto.id = lastItem.id + 1;
                    }else{
                        producto.id = id;
                    }
                }
                data.push(producto);
                await fs.promises.writeFile(this.archive, JSON.stringify(data, null, 2));
                console.log('Producto cargado correctamente.');
            }
        } catch(err){
            console.log(err);
        }
    }

    async getById(id){
        try{
            const data = JSON.parse(await fs.promises.readFile(this.archive, 'utf-8'));
            const objId = data.find(obj => obj.id === id);
            /* objId ? console.log(objId) : console.log(null); */
            return objId;
        } catch(err){
            return false;
        }
    }

    async getAll(){
        try{
            const data = JSON.parse(await fs.promises.readFile(this.archive, 'utf-8'));
            /* console.log(data); */
            return data;
        } catch(err){
            return false;
        }
    }

    async deleteById(id){
        try{
            const obj = await this.getById(id);
            const data = await this.getAll();
            const newArray = data.filter(item => item.id != obj.id);
            await fs.promises.writeFile(this.archive, JSON.stringify(newArray, null, 2));
            console.log('Producto eliminado correctamente.');
        } catch(err){
            console.log('El producto indicado ya se ha eliminado.');
        }
    }

    async deleteAll(){
        try{
            const data = await this.getAll();
            data.splice(0, data.length);
            await fs.promises.writeFile(this.archive, JSON.stringify(data, null, 2));
            console.log('Productos borrados corectamente.');
        } catch(err){
            console.log(err);
        }
    }
}

const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

const cont = new Contenedor('./productos.txt');

const generateRandomId = (max, min) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// Routes
app.get('/', (req, res) => {
    res.send(`
        <h3>Rutas</h3>
        <a href="/productos"><p>/productos</p></a>
        <a href="/productoRandom"><p>/productoRandom</p></a>
    `);
});

// productos
app.get('/productos', (req, res) => {
    cont.getAll()
    .then((data) => {
        res.send(JSON.stringify(data, null, 2));
    })
});

// productoRandom
app.get('/productoRandom', (req, res) => {
    let randomId = generateRandomId(3, 1);
    cont.getById(randomId)
    .then((data) => {
        res.send(JSON.stringify(data, null, 2));
    })
});

// Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});