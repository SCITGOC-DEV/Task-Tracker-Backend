const verifyAdminRoles = (approvedRole) => {
    return (req,res,next)=>{
        if (!approvedRole.includes(req.roleFromToken)) {
            res.json({message:"you dont have required admin permissions for this endpoint"});
        }
        next();
    }
}

module.exports = verifyAdminRoles;