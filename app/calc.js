function sum (arr) {
	var summa = 0
	for (var i = 0; i < arr.length; i++) {
		summa += arr[i]
	}
	return summa
}

module.exports.sum = sum