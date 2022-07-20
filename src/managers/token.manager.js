module.exports = function() {
    const tokens = [];

    const generateNewToken = () => {
        let token = Array(10).fill().map(()=>Math.random().toString(36).slice(4)).join('');
        tokens.push(token);
        return token;
    }

    const invalidateToken = token => {
        let tokenIndex = tokens.indexOf(token)
        if(tokenIndex>-1) {
            tokens.splice(tokenIndex, 1);
        }
    }

    const isTokenValid = token => {
        return tokens.indexOf(token) > -1
    }

    return {
        tokens,
        generateNewToken,
        invalidateToken,
        isTokenValid
    }
}