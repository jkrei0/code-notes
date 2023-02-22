function intersects(a, b, c, d) {
    return intersectsC(a.x, a.y, b.x, b.y,
                            c.x, c.y, d.x, d.y);
}

// returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
function intersectsC(a,b,c,d,p,q,r,s) {
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
        return false;
    } else {
        lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
        gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
};