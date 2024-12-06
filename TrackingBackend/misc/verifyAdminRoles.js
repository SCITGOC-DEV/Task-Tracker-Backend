const verifyAdminRoles = (approvedRole) => {
    return (req,res,next)=>{
        if (!approvedRole.includes(req.roleFromToken)) {
            return res.json({message:"you dont have required admin permissions for this endpoint", success: false});
        }
        next();
    }
}

module.exports = verifyAdminRoles;