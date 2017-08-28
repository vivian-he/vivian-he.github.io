

function showDescription(descript){
	$("#description").html("Description: " + descript);
}

function hideDescription(){
	$("#description").html("");
}

function validate(){

	//birthday
	var text_bday = $("#txtDate").val();
	var input_bday_date = new Date(text_bday);
	var today = new Date();

	if (input_bday_date >= today){
		alert("Date of Birth is not valid. Date has to be before today.")
		return false;
	}

	//phone
	var input_phone = $("#phone").val();
	if (isNaN(input_phone)){
		alert("Phone number is not valid or not in a valid format.")
		return false;
	}
}





