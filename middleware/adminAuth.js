const { verifyToken } = require("../helper");

const adminAuth =(req,res,next)=>{
    const accessToken = req?.headers?.authorization;
    if(accessToken){
        if(verifyToken(accessToken)){
            next();
        }else{
            res.send(
                {
                    flag:0,
                    message:"Invalid access token!"
                }
            )
        }
    }else{
        res.send(
            {
                flag:0,
                message:"Access token is required!"
            }
        )
    }
}

module.exports= adminAuth