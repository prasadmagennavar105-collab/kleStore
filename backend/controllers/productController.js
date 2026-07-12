const {Product} = require('../Model/Product');
const { User} = require('../Model/User');


// to get all the products
const getAllProducts = async(req,res)=>{
    try{
        const products = await Product.find();
        return res.status(200).json({
            message:"Product fetched Successfully",
            products
        })

    }catch(error){
        return res.status(500).json({
            message:"Server error",
            error:error.message
        })
    }
}

// get only the logged-in user's product
const getMyProducts = async(req,res)=>{
    try{
       const user = await User.findOne({email:req.user.email});
       if(!user){
        return res.status(404).json({
            message:"User not found"
        })
       }
    //    find the product
    const product = await Product.find({user:user._id})
    return res.status(200).json({
        message:"My product fetched Successfully",
        product
    })

    }catch(error){
        return res.status(500).json({
            message: "Server error",
            error:error.message
        })
    }
}

// get single product
const getProductById = async(req,res)=>{
    try{
        let {id} = req.params;
        const product = await Product.findById(id);
        if(!product){
            return res.status(404).json({
                message:"Product Not found"
            })
        }
        return res.status(200).json({
            message:"Product found",
            product
        })
    }catch(error){
        return res.status(500).json({
            message:"Server error",
            error:error.message
        })
    }
}



//  add product
const addProduct = async(req,res)=>{
    try{
        let{name,price,image,brand,stock,description}= req.body;
        if(!name || !price || !description || !image){
            return res.status(400).json({
                message:"Fields are missing"
            })
        }

        // find user 
        let user = await User.findOne({email:req.user.email});
        
        // create product
        const product = await Product.create({
            name,
            image,
            stock,
            brand,
            price,
            description,
            user:user._id
        })
       
        return res.status(201).json({
            message:"Product created successfully",
            product
        })


    }catch(error){
        return res.status(500).json({
            message:"Server Error",
            error:error.message
        })
    }
}

// update product
const updateProduct = async(req,res)=>{
    try{
        let {id} = req.params;
        let{name,price,description,image,brand,stock} = req.body;

        // find product
        let product = await Product.findById(id);
        if(!product){
            return res.status(404).json({
                message:"Product not found"
            })
        }

        // find user
        const user = await User.findOne({email:req.user.email});
        if(!user){
            return res.status(404).json({
                message:"User not found"
            })
        }

        // ownership check- only valid user can update
        if(!product.user || product.user.toString() !== user._id.toString()){
            return res.status(403).json({
                message:"Forbiden: You are not own this product"
            })
        }

        //  only update fields that were actuall sent
        product.name = name !== undefined ? name : product.name;
        product.description = description !== undefined ? description : product.description;
        product.image = image !== undefined ? image : product.image;
        product.price = price !== undefined ? price : product.price;
        product.stock = stock !== undefined ? stock : product.stock;
        product.brand = brand !==  undefined ? brand : product.brand;


        await product.save();
        return res.status(200).json({
            message:"Product update successfully",
            product
        })

    }catch(error){
        return res.status(500).json({
            message:"Server Error",
            error:error.message
        })
    }
}

// delet product
const deletProduct = async(req,res)=>{
    try{
        const {id} = req.params;
        const product = await Product.findById(id);
                if(!product){
            return res.status(404).json({
                message:"Product not found"
            })
        }

        const user = await User.findOne({email:req.user.email})
        if(!user){
            return res.status(400).json({
                message:"user not found"
            })
        }
        // ownership check
        if(!product.user || product.user.toString() !== user._id.toString()){
            return res.status(403).json({
                message:"Forbidden: you dont own this product"
            })
        }

        await Product.findByIdAndDelete(id);
        return res.status(200).json({
            message:"Product deleted successfully"
        })

    }catch(error){
        return res.status(500).json({
            message:"Server error",
            error:error.message
        })
    }
}

//toggle like/dislike
const toggleLikeProduct = async(req,res)=>{
    try{
        const {id} = req.params;
        const product = await Product.findById(id);
        if(!product){
            return res.status(404).json({
                message:"Product not found"
            })
        }
        const user = await User.findOne({email:req.user.email})
        if(!user){
            return res.status(404).json({
                message:"User not found"
            })
        }
        if(!product.likes){
            product,likes = [];
        }
        //check is this is user already likes product
        const index = product.likes.findIndex((id)=>{
            return id.toString() == user._id.toString()
        })
        if(index === -11){
            product.likes.push(user._id);

        }else{
            product.likes.splice(index,1)
        }
        await product.save();
        return res.status(200).json({
            message:"Product like status toggled successfully",
            product
        })
        
   }catch(error){
        return res.status(500).json({
            message:"Server Error",
            error:error.message
        })
    }
}
//get wishlist
const getwishlistProducts = async(req,res)=>{
    try{
        const user = await User.findOne({email:req.user.email});
        if(!user){
            return res.status(404).son({
                message:"User not found"
            })
        }

        const products = await Product.find({likes:user._id});
        return res.status(200).json({
            message:"wishlist fetched successfully",
            products
        })

    }catch(error){
        return res.status(500).json({
            message:"Server Error",
            error:error.message
        })
    }
}



module.exports = {getAllProducts,
                  getMyProducts,
                  getProductById,
                  addProduct,
                  updateProduct,
                  deletProduct,
                  toggleLikeProduct,
                  getwishlistProducts

    }