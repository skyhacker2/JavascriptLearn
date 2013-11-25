text = "000-00-0000"
pattern = /\d{3}\-\d{2}\-\d{4}/
pattern2 = ///
	\d{3}\-
	\d{2}\-
	\d{4}
///

console.log pattern2.test text