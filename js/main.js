//javascript referenced from Stack Over Flow
//functions here are solely for calculating the pricing based on amount
var bun_amt = new Array();
bun_amt["one"]=5;
bun_amt["three"]=14;
bun_amt["six"]=25;
bun_amt["twelve"]=50;

function getBunPrice()
{  
    var amountPrice=5;
    var theForm = document.forms["bunform"];
    var selectedAmt = theForm.elements["selectedamount"];

    for(var i = 0; i < selectedAmt.length; i++)
    {
        //if the radio button is checked
        if(selectedAmt[i].checked)
        {

            amountPrice = bun_amt[selectedAmt[i].value];

            break;
        }
    }
    return amountPrice;
}


function calculateTotal()
{
    var amtPrice = getBunPrice() 
    
    //display the result
    var divobj = document.getElementById('totalPrice');
    divobj.style.display='block';
    divobj.innerHTML = "<h3>$ "+amtPrice+"</h3>";
}
