var R = require("ramda");

module.exports = function getContainersNames (namesList, containersList) {
    if (R.isArrayLike(namesList)) {
        return namesList;
    } else {
        return R.lift(R.prop("name"))(containersList);
    }
};
