const argon2 = require("argon2");
var jwt = require('jsonwebtoken');

const hashingOptions = {
    type: argon2.argon2id,
    memoryCost: 2 ** 14,
    timeCost: 2,
    parallelism: 1,
};

const hashPassword = (req, res, next) => {

    argon2
        .hash(req.body.password, hashingOptions)
        .then((hashedPassword) => {
            req.body.hashedPassword = hashedPassword;
            delete req.body.password;

            next();
        })
        .catch((err) => {
            console.error(err);
            res.sendStatus(500);
        });
};

const verifyPassword = (req, res) => {
    argon2
        .verify(req.user.hashedPassword, req.body.password)
        .then((isVerified) => {
            if (isVerified) {
                const payload = { sub: req.user.id };
                const token = jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    { expiresIn: "1h" }
                );

                delete req.user.hashedPassword;
                res.send({ token, user: req.user });
            } else {
                res.sendStatus(401);
            }
        })
        .catch((err) => {
            console.error(err);
            res.sendStatus(500);
        });
}

const verifyToken = (req, res, next) => {
    console.log("req.params.id: ", req.params.id);
    
    try {
        const authorizationHeader = req.get("Authorization");
        if (!authorizationHeader) throw new Error("No authorization header");
        
        const [type, token] = authorizationHeader.split(' ');
        if (type !== "Bearer") throw new Error("Authorization header has not the 'Bearer' type");

        req.payload = jwt.verify(token, process.env.JWT_SECRET);
        
        next();
    } catch (err) {
        console.error(err);
        res.sendStatus(401);
    }
}

const verifyPayloadId = (req, res, next) => {
    const id = req.params.id
    console.log("req.params.id: ", req.params.id);
    

    try {
        const authorizationHeader = req.get("Authorization");
        if (!authorizationHeader) throw new Error("No authorization header");
        
        const [type, token] = authorizationHeader.split(' ');
        if (type !== "Bearer") throw new Error("Authorization header has not the 'Bearer' type");
        
        if (String(id) !== String(req.payload.sub)) throw new Error("Id doesn't match");

        req.payload = jwt.verify(token, process.env.JWT_SECRET);

        next();
    } catch (err) {
        console.error(err);
        res.sendStatus(401);
    }
}

module.exports = {
    hashPassword,
    verifyPassword,
    verifyToken,
    verifyPayloadId
};
