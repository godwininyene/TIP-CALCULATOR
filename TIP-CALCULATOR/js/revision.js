// Bill Controller
var billController = (function(){
	var Bill = function(id, sn, location, bill, percentage){
		this.id = id;
		this.sn = sn;
		this.location = location;
		this.bill = bill;
		this.percentage = percentage;
	};

	Bill.prototype.calculateBill = function(){
		//1. Calculate Tip
		this.tip = Math.round((this.percentage/100) * this.bill);
		//2. Calculate total amount
		this.totalBill = this.tip + this.bill;
	};
	var calculateTotal = function(property){
		var sum = 0;
		data.allBills.forEach(function(cur){
			sum+= cur[property];
		});
		data.totals[property]=sum;
	};

	var getItemIndex = function(id){
		var ids, index;
		ids = data.allBills.map(function(cur){
			return cur.id;
		});
		index = ids.indexOf(id);
		return index;
	};

	var data = {
		allBills:[],
		totals:{
			totalBill:0,
			tip:0
		}
	};

	return{
		addItem:function(location, bill, percentage){
			var ID, newItem, Sn;
			// Create an ID for each item
			if(data.allBills.length > 0){
				ID = data.allBills[data.allBills.length - 1].id +1;
			}else{
				ID =0;
			}
			// Create serial number for new item
			Sn = ID+1;
			// Create instance of a new bill
			newItem = new Bill(ID, Sn, location, bill, percentage);
			// Calculate bill
			newItem.calculateBill();
			// Add new bill to internal data structure
			data.allBills.push(newItem);
			return newItem;
		},
		deleteItem:function(id){
			var index = getItemIndex(id);
			if(index !== -1){
				data.allBills.splice(index, 1);
			}

		},
		retrieveItem:function(id){
			var index = getItemIndex(id);
			return data.allBills[index];
		},
		replaceItem:function(id, location, bill, percentage){
			var index, oldItem, editedItem;
			//1. Get item to be replace position
			index = getItemIndex(id);
			//2. Get old Item
			oldItem = data.allBills[index];
			//3. Replace old item with newly edited item
			editedItem = oldItem;
			//4. Replace previous data with new data
			editedItem.location=location;
			editedItem.bill=bill;
			editedItem.percentage=percentage;
			//5. Recalculate bill
			editedItem.calculateBill();
			//6. Set instances of an edited item
			editedItem = oldItem;
			//7. Replace old item with edited item
			data.allBills[index]= editedItem;
			//8. Return edited item;
			return editedItem;
		},	
		calculateTotalBills:function(){
			calculateTotal('totalBill');
			calculateTotal('tip');
		},
		getTotalBills:function(){
			return{
				totalBill:data.totals.totalBill,
				tip: data.totals.tip
			};
		},

		persistData:function(){
			localStorage.setItem('data', JSON.stringify(data));
		},
		readStorage:function(){
			const storage = JSON.parse(localStorage.getItem('data'));
			if(storage) data = storage; return storage;
		}
	};

})();


// UI Controller
var UIController = (function(){
	var DOMstrings = {
		location:'#location',
		bill:'#bill',
		percentage:'#percentage',
		addBtn:'#add-btn',
		saveChangeBtn:'#saveChange-btn',
		dataTable:'#data-table',
		itemTable:'.item-table',
		billLabel:'.total-bill',
		tipLabel:'.total-tip',
		dateLabel:'.summary-date'
	};

	return{
		getInput:function(){
			return{
				location: document.querySelector(DOMstrings.location).value,
				bill: parseFloat(document.querySelector(DOMstrings.bill).value),
				percentage:parseFloat(document.querySelector(DOMstrings.percentage).value)
			}
		},
		addListItem:function(obj){
			var html, newHtml;
			//1. Create HTML with placeholder text
			html = `<tr class="item" id="item-%id%"><td>%sn%</td><td>%location%</td><td>%bill%</td>
						<td>%percentage%</td><td>%tip%</td><td>%totalBill%</td>
						<td>
							<span class="btn btn-warning" id='edit-btn'>Edit</span>
							<span class="btn btn-danger" id='delete-btn'>Delete</span>
						</td>
				</tr>`
			//2. Replace placeholder text with actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%sn%', obj.sn);
			newHtml = newHtml.replace('%location%', obj.location);
			newHtml = newHtml.replace('%bill%', obj.bill.toLocaleString('en'));
			newHtml = newHtml.replace('%percentage%', obj.percentage +'%');
			newHtml = newHtml.replace('%tip%', obj.tip);
			newHtml = newHtml.replace('%totalBill%', obj.totalBill.toLocaleString('en'));
			//2. Insert the new html into the DOM
			document.querySelector(DOMstrings.itemTable).insertAdjacentHTML('beforeend', newHtml);
		},
		clearFields:function(){
			var fields = document.querySelectorAll(DOMstrings.location + ', '+ DOMstrings.bill + ', ' + DOMstrings.percentage);
			fields.forEach(function(cur){
				cur.value="";
			});
			fields[0].focus();
		},
		getItemId: function(eventObject){
			var splitID, itemID, ID;
			itemID=eventObject.target.parentNode.parentNode.id;
			if(itemID){
				splitID = itemID.split('-');
				ID = parseInt(splitID[1]);
				return{
					itemID,
					ID
				};
			}
		},
		deleteListItem:function(selectorID){
			var child = document.getElementById(selectorID);
			child.parentNode.removeChild(child);
		},
		fillInputFields:function(item){
			document.querySelector(DOMstrings.location).value = item.location;
			document.querySelector(DOMstrings.bill).value = item.bill;
			document.querySelector(DOMstrings.percentage).value = item.percentage;
			document.querySelector(DOMstrings.location).focus();
		},
		replaceListItem:function(selectorID, item){
			var el, childNodes;
			el= document.getElementById(selectorID);
			childNodes = el.getElementsByTagName('td');
			childNodes[1].textContent= item.location;
			childNodes[2].textContent= item.bill.toLocaleString('en');
			childNodes[3].textContent= item.percentage +'%';
			childNodes[4].textContent= item.tip
			childNodes[5].textContent= item.totalBill.toLocaleString('en');
		},
		displayBill:function(bill){
			document.querySelector(DOMstrings.billLabel).textContent = bill.totalBill.toLocaleString('en');
			document.querySelector(DOMstrings.tipLabel).textContent = bill.tip.toLocaleString('en');
		},
		indicateSelection:function(selectorID){
			var el = document.querySelectorAll('tr'); 
			el.forEach(function(cur){
				cur.classList.remove('editedItem');
			});
			document.getElementById(selectorID).classList.add('editedItem');
		},
		removIndication:function(selectorID){
			document.getElementById(selectorID).classList.remove('editedItem');
		},
		
		flipBtn:function(isEditing){
			if(isEditing){
				document.querySelector(DOMstrings.addBtn).style.visibility='hidden';
				document.querySelector(DOMstrings.saveChangeBtn).style.visibility ='visible';
			}else{
				document.querySelector(DOMstrings.saveChangeBtn).style.visibility ='hidden';
				document.querySelector(DOMstrings.addBtn).style.visibility='visible';
			}
			
		},
		displayDate:function(){
			var months, month, now, date, year;
			 months = ['January', 'February', 'March', 'April', 'May','June','July','August','September', 'October', 'November', 'December'];
			 now = new Date();
			 date = now.getDate();
			 month = now.getMonth();
			 year = now.getFullYear();
			 document.querySelector(DOMstrings.dateLabel).textContent = date + ' '+ months[month]+ ', '+year;
		},
		
		getDOMstrings:function(){
			return DOMstrings;
		}
	};
})();

// Global App Controller
var controller = (function(billCtrl, UICtrl){
	// Global variables
	var itemID, ID, isEditing;
	// Get Dom strings from UI Controller
	var DOM = UICtrl.getDOMstrings();
	var setupEventListener = function(){
		document.querySelector(DOM.addBtn).addEventListener('click', ctrlAddItem);
		document.addEventListener('keypress', function(event){
			if(event.keyCode == 13 || event.which == 13){
				if(!isEditing){
					ctrlAddItem();
				}else{
					ctrlSaveChanges();
				}
			}
		});
		document.querySelector(DOM.itemTable).addEventListener('click', ctrlDeleteItem);
		document.querySelector(DOM.itemTable).addEventListener('click', ctrlEditing);
		document.querySelector(DOM.saveChangeBtn).addEventListener('click', ctrlSaveChanges);
	};

	var updateBill = function(){
		// 1. Calculate bill
		billCtrl.calculateTotalBills()
		// 2. Get bill
		var bill = billCtrl.getTotalBills();
		// 3. Update bill to UI
		UICtrl.displayBill(bill);
	};

	var ctrlAddItem = function(){
		var input, newItem;
		//1. Get Input field data
		input = UICtrl.getInput();
		if(input.location !=="" && !isNaN(input.bill) && !isNaN(input.percentage) && input.bill > 0 && input.percentage > 0){
			//2. Add data to internal data structure
			newItem = billCtrl.addItem(input.location, input.bill, input.percentage);
			//3. Display Table
			document.querySelector(DOM.dataTable).className = 'table';
			//4. Add item to UI
			UICtrl.addListItem(newItem);
			//5. Clear fields
			UICtrl.clearFields();
			//6. update bill
			updateBill();



			billCtrl.persistData();
		}
	};

	var ctrlDeleteItem = function(event){
		// Get Item ID
		var ID = UICtrl.getItemId(event);
		if(event.target.id == 'delete-btn'){
			// 1. Delete item from the data structure
			billCtrl.deleteItem(ID.ID);
			// 2. Delete item from the UI
			UICtrl.deleteListItem(ID.itemID);
			// 3. Recalculate and show new bill
			updateBill();


			billCtrl.persistData();
		}
	};

	var ctrlEditing = function(event){
		isEditing= true;
		var item, id;
		// Get item id
		id = UICtrl.getItemId(event);
		itemID = id.itemID;
		ID = id.ID;
		if(event.target.id =='edit-btn'){
			// 1. Format add button
			UICtrl.flipBtn(isEditing);
			// 2. Indicated the highlighted item
			UICtrl.indicateSelection(itemID);
			// 3. Retreive item from internal data structure
			item = billCtrl.retrieveItem(ID);
			// 4. Fill input fields with values
			UICtrl.fillInputFields(item);
		}
	};

	var ctrlSaveChanges = function(){
		isEditing=false;
		var input, editedItem;
		// 1. Get input
		input = UICtrl.getInput();
		if(input.location !=="" && !isNaN(input.bill) && !isNaN(input.percentage) && input.bill > 0 && input.percentage > 0){
			// 2. Replace item in internal data structure
			editedItem=billCtrl.replaceItem(ID, input.location, input.bill, input.percentage);
			// 3. Replace item in UI 
			UICtrl.replaceListItem(itemID, editedItem);
			//4. Clear fields
			UICtrl.clearFields();
			//5.Recalculate and show total bill
			updateBill();
			//6. Format button
			UICtrl.flipBtn(isEditing);
			//7. Remove selected item indicated
			UICtrl.removIndication(itemID);


			billCtrl.persistData();
		}	
	};

	var controlPersistData = function(){
		var data, allBills, totals;
		data = billCtrl.readStorage();
		if(data.allBills.length > 0){
			// Display Table
			document.querySelector(DOM.dataTable).className = 'table';
			// Retrieve bill(s) from the storage
			allBills = data.allBills;
			// Render bill(s) to the UI
			allBills.forEach(el =>{
				UICtrl.addListItem(el)
			});
			// Retrieve total(s) from the storage
			totals= data.totals;
			// Render total(s) to the UI
			UICtrl.displayBill(totals);

		}
	};

	return{
		init:function(){
			setupEventListener();
			UICtrl.displayBill({
				totalBill:0,
				tip:0
			});
			UICtrl.displayDate();
			controlPersistData();
		}
	};
})(billController, UIController);

controller.init();

