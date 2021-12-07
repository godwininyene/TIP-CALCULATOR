// TIP CONTROLLER
var tipController = (function(){
	function Item(id, location, bill, percentage, tip, finalPaid){
		this.id = id;
		this.location = location;
		this.bill = bill;
		this.percentage = percentage;
		this.tip = tip;
		this.finalPaid = finalPaid;
	}
	var calculateTotal = function(property){
		var sum = 0;
		data.allItems.forEach(function(cur){
			sum+= cur[property];
		});
		data.totals[property] = sum;
	};
	var data = {
		allItems:[],
		totals:{
			bill:0,
			tip:0
		}

	};

	return{
		addItem:function(location, bill, percentage){
			var ID, newItem, tip, finalPaid;
			// create new ID
			if(data.allItems.length > 0){
			 	ID = data.allItems[data.allItems.length - 1].id + 1;
			 }else {
			 	ID = 1;
			}
			// Calculate Tip
			 	tip = (percentage/100) * bill;
			// Calculate Final paid value
			 	finalPaid = tip + bill;
			// create instances of a new item
			 newItem = new Item(ID, location, bill, percentage, tip, finalPaid);

			// push new item to data structure
			 data.allItems.push(newItem);

			// return new item
			 return newItem;

		},
		deleteItem:function(id){
			var ids, index;
			ids = data.allItems.map(function(cur){
				return cur.id;
			})
			index = ids.indexOf(id);
			//index = data.allItems.findIndex(cur =>  cur.id == id)
			if(index !== -1){
				data.allItems.splice(index, 1);
			}
		},
		replaceItem:function(id, location, bill, percentage){
			var index, ID, tip, finalPaid, prevItem, editedItem ;
			index = data.allItems.findIndex(cur => cur.id == id);
			prevItem = data.allItems[index];
			// Set iD
			ID = prevItem.id;
			// Calculate Tip
			tip = (percentage/100) * bill;
			// Calculate Final paid value
			 finalPaid = tip + bill;
			 // create instances of an edited item
			 editedItem = new Item (ID, location, bill, percentage, tip, finalPaid);
			 //replace edited item with previous item
			 data.allItems[index] = editedItem;
			 return editedItem;
		},
		calculateTotal:function(){
			calculateTotal('bill');
			calculateTotal('tip');
		},
		getTotal: function(){
			return{
				bill: data.totals.bill,
				tip: data.totals.tip
			}
		},
		getDataLength:function(){
			return data.allItems.length;
		},
		getItem:function(id){
			var index;
			index = data.allItems.findIndex(cur => cur.id == id);
			return data.allItems[index];
		},
		testing:function(){
			console.log(data)
		}
	}

})();

var UIController = (function(){
	var DOMstring = {
		form:'.form',
		formBtnGroup:'#form-btn-group',
		addBtn:'#add-btn',
		editBtn:'#edit-btn',
		inputLocation: '#location',
		inputBill: '#bill',
		inputPercentage:'#percentage',
		itemTable: '.item-table',
		billLabel: '.total-bill',
		tipLabel: '.total-tip',
		dateLabel:'.summary-date'
	};
	var formattedNumber = function(num){
		var numSplit, int, dec;
		num = num.toFixed(2);
		numSplit = num.split('.');
		int = numSplit[0];
		if(int.length > 3 ){
			int = int.substr(0, int.length - 3) + ','+ int.substr(int.length - 3, int.length);
		}
		dec = numSplit[1];
		return int +'.'+ dec;
	};

	return{

		getInput:function(){
			return {
				location: document.querySelector(DOMstring.inputLocation).value,
				bill:parseFloat(document.querySelector(DOMstring.inputBill).value),
				percentage:parseFloat(document.querySelector(DOMstring.inputPercentage).value)
			}
		},
		getItemID:function(event){
		var  itemID, splitID, ID;
		itemID = event.target.parentNode.parentNode.id;
		splitID = itemID.split('-');
		ID = parseInt(splitID[1]);
		return [itemID, ID];
		},
		addNewItem:function(obj){
			var html, newHtml;
			html = `<tr class="item" id="item-%id%"><td>%sn%</td><td>%location%</td><td>%bill%</td>
					<td>%percentage%</td><td>%tip%</td><td>%final value%</td><td>
						<span class="btn btn-warning">Edit</span>
						<span class="btn btn-danger" id='delete-btn-%id%'>Delete</span>
						</td>
					</tr>`
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%sn%',obj.id);
			newHtml = newHtml.replace('%location%',obj.location);
			newHtml = newHtml.replace('%bill%',formattedNumber(obj.bill));
			newHtml = newHtml.replace('%percentage%',obj.percentage + '%');
			newHtml = newHtml.replace('%tip%',formattedNumber(obj.tip));
			newHtml = newHtml.replace('%final value%',formattedNumber(obj.finalPaid));
			document.querySelector(DOMstring.itemTable).insertAdjacentHTML('beforeend', newHtml);
		},
		deleteListItem:function(selectorID){
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},
		editItem:function( location, bill, percentage){
			var editBtn;
			document.querySelector(DOMstring.inputLocation).value = location;
			document.querySelector(DOMstring.inputBill).value = bill;
			document.querySelector(DOMstring.inputPercentage).value = percentage;
			document.querySelector(DOMstring.inputLocation).focus();
			editBtn = `<span class="btn btn-success" id="edit-btn">Save Changes</span>`;
			document.querySelector(DOMstring.formBtnGroup).innerHTML = editBtn;
		},
		addEditedItem:function(ID, item){
			var el, addBtn, td;
			el = document.getElementById(ID); 
			el.classList.remove('editedItem');
			td = el.getElementsByTagName('td');
			td[1].textContent = item.location;
			td[2].textContent = formattedNumber(item.bill);
			td[3].textContent = item.percentage + '%';
			td[4].textContent = formattedNumber(item.tip);
			td[5].textContent = formattedNumber(item.finalPaid);
			addBtn =`<span class="btn btn-primary" id="add-btn">Submit</span>`;
			document.querySelector(DOMstring.formBtnGroup).innerHTML = addBtn;
		},
		highLightSelected:function(selectorID){
			var table = document.querySelector(DOMstring.itemTable);
			var tr = Array.from(table.getElementsByTagName('tr'));
			tr.forEach(el =>{
				el.classList.remove('editedItem');
			})
			document.getElementById(selectorID).classList.add('editedItem');
		},
		clearFields:function(){
			var fields, fieldsArr;
			fields = document.querySelectorAll(DOMstring.inputLocation +',' + DOMstring.inputBill + ',' +DOMstring.inputPercentage);
				for(var i = 0; i < fields.length; i++){
					fields[i].value = '';
				}
			fields[0].focus();
		},
		displayTotal: function(obj){
			document.querySelector(DOMstring.billLabel).textContent = formattedNumber(obj.bill);
			document.querySelector(DOMstring.tipLabel).textContent = formattedNumber(obj.tip);
		},
		displayDate:function(){
			var now,date, months,month, year;
			now = new Date();
			date = now.getDate();
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October','November', 'December']
			month  = now.getMonth();
			year = now.getFullYear();
			document.querySelector(DOMstring.dateLabel).textContent = date + ' '+ months[month] + ','+ ' '+ year;
		},
		getDomstring:function(){
			return DOMstring;
		}
	};
})();

var controller = (function(tipCtrl, UIctrl){
	var setUpEventListener = function(){
		var DOM = UIctrl.getDomstring();
		document.querySelector(DOM.form).addEventListener('click', saveChanges);
		document.querySelector(DOM.addBtn).addEventListener('click', ctrlAddItem);
		document.querySelector(DOM.itemTable).addEventListener('click', ctrlDeleteItem);
		document.querySelector(DOM.itemTable).addEventListener('click', ctrlEditItem);

		document.addEventListener('keypress', function(event){
			if(event.keyCode == 13 || event.which == 13){
				ctrlAddItem();
			}
		})
	};

	var updateTotal = function(){
		// 1. Calculate total Bill and Tip
		tipCtrl.calculateTotal();
		// 2. Get total Bills and Tips
		var total = tipCtrl.getTotal();
		// 3. Display total Bills and Tips
		UIctrl.displayTotal(total);
	};
	var ctrlAddItem = function(){
		var input, newItem;
		//1. Get Input field data
		input = UIctrl.getInput();
		if(input.location !== "" && !isNaN(input.bill) && !isNaN(input.percentage)){
			// 2. Add new Item to internal Data Structure and calculate both tip and final paid value
			newItem = tipCtrl.addItem(input.location, input.bill, input.percentage);
			// 3. Add new item to UI
			UIctrl.addNewItem(newItem);
			// Display Table
			document.querySelector('#data-table').className = 'table';
			// 4. Clear fields
			UIctrl.clearFields();
			// 5. Calculate and update total
			updateTotal();
		}
	};
	var ctrlDeleteItem =  function(event){
		var itemID, ID, dataLength;
		[itemID, ID] = UIctrl.getItemID(event); 
		dataLength = tipCtrl.getDataLength();
		if(itemID){
			if(event.target.className == 'btn btn-danger'){
				//1. Delete Item from Data Structure
				tipCtrl.deleteItem(ID);
				// 2. Delete Item from the UI
				UIctrl.deleteListItem(itemID);
				// 3. Recalculate total bills and tips
				updateTotal();
				// 4. Hide table if there is no item to display
				if(dataLength <= 1){
					document.querySelector('#data-table').className = 'hidden';
				}
			}
		}
	};

	var itemID, ID;
	var ctrlEditItem = function(event){
		var item;
		[itemID, ID] = UIctrl.getItemID(event); 
		if(itemID){
			if(event.target.className.includes('btn-warning')){
				// 1. Get the item to be edited from the internal data structure
				item = tipCtrl.getItem(ID);
				//2. Add the datas to be edited on the UI
				//UIctrl.indicateItemEdited(itemID);
				UIctrl.editItem(item.location, item.bill, item.percentage);

				UIctrl.highLightSelected(itemID);
			}
		}
	};
	var saveChanges = function(event){
		var input, editedItem;
		if(event.target.id.includes('edit-btn')){
			// 1. Get Edited inputs
			input = UIctrl.getInput();
			if(input.location !== "" && !isNaN(input.bill) && !isNaN(input.percentage)){
				// 2. Add edited item to the internal Data Structure
				editedItem = tipCtrl.replaceItem(ID, input.location, input.bill, input.percentage);
				// 3. Add edited item to the UI
				UIctrl.addEditedItem(itemID, editedItem);
				// 4. Clear Fields
				UIctrl.clearFields();
				// 5. Recaculate total
				updateTotal();
			}
		}
	};

	return{
		init:function(){
			console.log('Application has started');
			UIctrl.displayDate();
			setUpEventListener();
			UIctrl.displayTotal({
				bill:0,
				tip:0
			})
		}
	}
})(tipController, UIController);
controller.init();