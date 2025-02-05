const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const errorHandler = require('./helper/error-handler');

app.use(cors());
app.options('*', cors);

// Middleware
app.use(bodyParser.json());
app.use(express.json({ limit: '50mb',extended : true }));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit:50000 }));
app.use('/public/uploads/gallery', express.static(__dirname + '/public/uploads/gallery'));
app.use('/public/uploads/singleImg', express.static(__dirname + '/public/uploads/singleImg')); 
app.use('/public/uploads/category', express.static(__dirname + '/public/uploads/category')); 
app.use('/public/uploads/variation', express.static(__dirname + '/public/uploads/variation'));

app.use(morgan('tiny'));
        
// Use authJwt middleware, excluding certain routes
/*app.use(authJwt().unless({ path: [
    { url: /\/api\/v1\/users\/login/, methods: ['POST'] },
    { url: /\/api\/v1\/users\/register/, methods: ['POST'] }
]}));*/
  
// Error handling middleware
app.use(errorHandler); 
  
const api = process.env.API_URL;

const productsRouter = require('./routers/products');
const ordersRouter = require('./routers/orders');
const categoriesRouter = require('./routers/categories');
const usersRouter = require('./routers/users');
const subcategoriesRouter = require('./routers/subcategories'); 
const reviewsRouter = require('./routers/reviews'); 
const cartRouter = require('./routers/carts');
const pincodeRouter = require('./routers/pincodes');
const subsubcategoriesRouter = require('./routers/subsubcategories');
const variationRouter = require('./routers/variations');
const shipmentRouter = require('./routers/shipments');
const invoiceRouter = require('./routers/invoices');

app.use(`${api}/users`, usersRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/products`, productsRouter);
app.use(`${api}/subcategories`, subcategoriesRouter); 
app.use(`${api}/subsubcategories`, subsubcategoriesRouter); 
app.use(`${api}/reviews`, reviewsRouter); 
app.use(`${api}/carts`, cartRouter);
app.use(`${api}/pincodes`,pincodeRouter);
app.use(`${api}/variations`, variationRouter);
app.use(`${api}/shipments`, shipmentRouter);
app.use(`${api}/invoices`, invoiceRouter)

mongoose.set('debug', true);  

mongoose.connect(process.env.CONNECTION_STRING)    
    .then(() => {   
        console.log("Database connection is ready for work...");
    })
    .catch((error) => {
        console.log(error);
    });

app.listen(4000, () => {
    console.log('Server is running at http://localhost:4000');  
});
  