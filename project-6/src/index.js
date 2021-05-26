import Web3 from "web3";
import SupplyChainArtifact from "../build/contracts/SupplyChain.json";

const App = {
    emptyAddress: "0x0000000000000000000000000000000000000000",
    web3: null,
    account: "0x0000000000000000000000000000000000000000",
    contract: null,
    item: {
        itemSKU: 0,
        itemUPC: 0,
        ownerID: "0x0000000000000000000000000000000000000000",
        originFarmerID: "0x0000000000000000000000000000000000000000",
        originFarmName: null,
        originFarmInformation: null,
        originFarmLatitude: null,
        originFarmLongitude: null,
        productID: null,
        productNotes: null,
        productPrice: 0,
        itemState: 0,
        distributorID: "0x0000000000000000000000000000000000000000",
        retailerID: "0x0000000000000000000000000000000000000000",
        consumerID: "0x0000000000000000000000000000000000000000"        
    },

    init: async function () {
        await App.initSupplyChain();
        await App.getMetaskAccountID()
        await App.fetchItem();
        App.bindEvents();
    },

    updateUPCs: function() {
        $("#harvest-upc").val(App.item.itemUPC);        
        $("#process-upc").val(App.item.itemUPC);        
        $("#pack-upc").val(App.item.itemUPC);        
        $("#sell-upc").val(App.item.itemUPC);        
        $("#buy-upc").val(App.item.itemUPC);        
        $("#ship-upc").val(App.item.itemUPC);        
        $("#receive-upc").val(App.item.itemUPC);        
        $("#purchase-upc").val(App.item.itemUPC);        
    },

    updateForm: function () {
        $("#upc").val(App.item.itemUPC);
        $("#sku").text(App.item.itemSKU);
        $("#ownerID").text(App.item.ownerID);
        $("#originFarmerID").text(App.item.originFarmerID);
        $("#originFarmName").text(App.item.originFarmName);
        $("#originFarmInformation").text(App.item.originFarmInformation);
        $("#originFarmLatitude").text(App.item.originFarmLatitude);
        $("#originFarmLongitude").text(App.item.originFarmLongitude);
        $("#productNotes").text(App.item.productNotes);
        $("#productPrice").text(App.item.productPrice);
        $("#distributorID").text(App.item.distributorID);
        $("#retailerID").text(App.item.retailerID);
        $("#consumerID").text(App.item.consumerID);

        switch (App.item.itemState)
        {
            case "0": $("#itemState").text("Harvested"); break;
            case "1": $("#itemState").text("Processed"); break;      
            case "2": $("#itemState").text("Packed"); break;          
            case "3": $("#itemState").text("ForSale"); break;               
            case "4": $("#itemState").text("Sold"); break;
            case "5": $("#itemState").text("Shipped"); break;
            case "6": $("#itemState").text("Received"); break;
            case "7": $("#itemState").text("Purchased"); break;
            default: $("#itemState").text("Unknown");
        }

    }, 

    initSupplyChain: async function () {
        const { web3 } = this;
        try {
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = SupplyChainArtifact.networks[networkId];
            this.contract = new web3.eth.Contract(
                SupplyChainArtifact.abi,
                deployedNetwork.address,
            );            
        } catch (error) {
            console.error(`Could not connect to contract or chain: ${error}` );
        }
    },

    getMetaskAccountID: async function() {
        const { web3 } = this;
        try {
            const accounts = await web3.eth.getAccounts();
            this.account = accounts[0];
            $("#currentAccountID").text(this.account);
            $("#harvest-ownerID").val(this.account);
            $("#harvest-originFarmerID").val(this.account);
        } catch (error) {
            console.error(`Could not get AccountId: ${error}` );
        }
    },    

    bindEvents: function() {
        $(document).on('click', App.handleButtonClick);
    },

    handleButtonClick: async function(event) {
        event.preventDefault();

        await App.getMetaskAccountID();

        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        switch(processId) {
            case 1:
                return await App.harvestItem(event);
                break;
            case 2:
                return await App.processItem(event);
                break;
            case 3:
                return await App.packItem(event);
                break;
            case 4:
                return await App.sellItem(event);
                break;
            case 5:
                return await App.buyItem(event);
                break;
            case 6:
                return await App.shipItem(event);
                break;
            case 7:
                return await App.receiveItem(event);
                break;
            case 8:
                return await App.purchaseItem(event);
                break;
            case 9:
                return await App.fetchItem();
                break;
            case 10:
                return await App.addFarmer(event);
            case 11:
                return await App.addDistributor(event);
            case 12:
                return await App.addRetailer(event);
            case 13:
                return await App.addConsumer(event);
            case 14:
                    return await App.fetchRoles(event);
        }
    },

    updateEventList: function(action, success, result) {
        var text = `${action}`; 
        if (success)
        {
            text += `: ${JSON.stringify(result)}`;
        }
        else
        {
            text += ` Failed`;
            text += `: ${result.message}`;
        }
        $("#ftc-events").append(`<li>${text}</li>`);        
    },

    
    addFarmer: async function(event) {
        this.addRole(event, "Farmer");
    },

    addDistributor: async function(event) {
        this.addRole(event, "Distributor");
    },

    addRetailer: async function(event) {
        this.addRole(event, "Retailer");
    },

    addConsumer: async function(event) {
        this.addRole(event, "Consumer");
    },

    addRole: async function(event, role) {
        event.preventDefault();
        var accountId = $("#accountID").val();
        try
        {
            const {
                addFarmer,
                addDistributor,
                addRetailer,
                addConsumer 
            } = this.contract.methods;
            var result = undefined; 
            switch (role)
            {
                case "Farmer": result = await addFarmer(accountId).send({from: App.account}); break;
                case "Distributor": result = await addDistributor(accountId).send({from: App.account}); break;
                case "Retailer": result = await addRetailer(accountId).send({from: App.account}); break;
                case "Consumer": result = await addConsumer(accountId).send({from: App.account}); break;
            }

            this.updateEventList(`add${role}`, true, result);
            console.log(`add${role}`,result);
        } catch (error) {
            console.log(`add${role} failed: ${error}`);
            this.updateEventList(`add${role}`, false, error);
        }
    },

    harvestItem: async function(event) {
        event.preventDefault();
        try
        {
            var newitem = {}
            newitem.itemUPC = $("#harvest-upc").val();
            newitem.ownerID = $("#harvest-ownerID").val();
            newitem.originFarmerID = $("#harvest-originFarmerID").val();
            newitem.originFarmName = $("#harvest-originFarmName").val();
            newitem.originFarmInformation = $("#harvest-originFarmInformation").val();
            newitem.originFarmLatitude = $("#harvest-originFarmLatitude").val();
            newitem.originFarmLongitude = $("#harvest-originFarmLongitude").val();
            newitem.productNotes = $("#harvest-productNotes").val();

            const {harvestItem} = this.contract.methods;
            const result = await harvestItem(
                newitem.itemUPC,
                newitem.originFarmerID,
                newitem.originFarmName,
                newitem.originFarmInformation,
                newitem.originFarmLatitude,
                newitem.originFarmLongitude,
                newitem.productNotes
            ).send({from: App.account});

            this.updateEventList("harvestItem", true, result);
            console.log('harvestItem',result);
            $('#fetch-upc').val(newitem.itemUPC);
            App.fetchItem();
        } catch (error) {
            this.updateEventList("harvestItem", false, error);
            console.log(`harvestItem failed: ${error}`);
        }
    },

    processItem: async function (event) {
        event.preventDefault();
        try
        {
            var itemUPC = $("#process-upc").val();
            const {processItem} = this.contract.methods;
            const result = await processItem(itemUPC).send({from: App.account});
            this.updateEventList("processItem", true, result);
            console.log('processItem', result);
        } catch(error) {
            this.updateEventList("processItem", false, error);
            console.log(`processItem failed: ${error}`);
        };
    },
    
    packItem: async function (event) {
        event.preventDefault();
        try
        {
            var itemUPC = $("#pack-upc").val();
            const {packItem} = this.contract.methods;
            const result = await packItem(itemUPC).send({from: App.account});
            this.updateEventList("packItem", true, result);
            console.log('packItem', result);
        } catch(error) {
            this.updateEventList("packItem", false, error);
            console.log(`packItem failed: ${error}`);
        }
    },

    sellItem: async function (event) {
        event.preventDefault();
        try
        {
            var itemUPC = $("#sell-upc").val();
            var itemPrice = $("#sell-productPrice").val();
            const {sellItem} = this.contract.methods;
            const result = await sellItem(itemUPC, itemPrice).send({from: App.account});
            this.updateEventList("sellItem", true, result);
            console.log('sellItem', result);
        } catch(error) {
            this.updateEventList("sellItem", false, error);
            console.log(`sellItem failed: ${error}`);
        }
    },

    buyItem: async function (event) {
        const { web3 } = this;
        event.preventDefault();
        try
        {
            var itemUPC = $("#buy-upc").val();
            const {buyItem} = this.contract.methods;
            const productPrice = web3.utils.toWei(App.item.productPrice, "ether")
            const result = await buyItem(itemUPC).send({from: App.account, value: productPrice});
            this.updateEventList("buyItem", true, result);
            console.log('buyItem', result);
        } catch(error) {
            this.updateEventList("buyItem", false, error);
            console.log(`buyItem failed: ${error}`);
        }
    },

    shipItem: async function (event) {
        const { web3 } = this;
        event.preventDefault();
        try
        {
            var itemUPC = $("#ship-upc").val();
            const {shipItem} = this.contract.methods;
            const result = await shipItem(itemUPC).send({from: App.account});
            this.updateEventList("shipItem", true, result);
            console.log('shipItem', result);
        } catch(error) {
            this.updateEventList("shipItem", false, error);
            console.log(`shipItem failed: ${error}`);
        }
    },

    receiveItem: async function (event) {
        const { web3 } = this;
        event.preventDefault();
        try
        {
            var itemUPC = $("#receive-upc").val();
            const {receiveItem} = this.contract.methods;
            const result = await receiveItem(itemUPC).send({from: App.account});
            this.updateEventList("receiveItem", true, result);
            console.log('receiveItem', result);
        } catch(error) {
            this.updateEventList("receiveItem", false, error);
            console.log(`receiveItem failed: ${error}`);
        }
    },

    purchaseItem: async function (event) {
        const { web3 } = this;
        event.preventDefault();
        try
        {
            var itemUPC = $("#purchase-upc").val();
            const {purchaseItem} = this.contract.methods;
            const result = await purchaseItem(itemUPC).send({from: App.account});
            this.updateEventList("purchaseItem", true, result);
            console.log('purchaseItem', result);
        } catch(error) {
            this.updateEventList("purchaseItem", false, error);
            console.log(`purchaseItem failed: ${error}`);
        }
    },

    fetchItem: async function (event) {
        const { web3 } = this;

        var itemUPC = $('#fetch-upc').val();
        console.log('fetch-upc', itemUPC);
        try
        {
            const {fetchItemBufferOne, fetchItemBufferTwo, fetchItemBufferThree } = this.contract.methods;
            var resultBufferOne = await fetchItemBufferOne(itemUPC).call({from: App.account});
            var resultBufferTwo = await fetchItemBufferTwo(itemUPC).call({from: App.account});
            var resultBufferThree = await fetchItemBufferThree(itemUPC).call({from: App.account});
            App.item = {
                itemSKU: resultBufferOne[0],
                itemUPC: resultBufferOne[1],
                ownerID: resultBufferOne[2],
                originFarmerID: resultBufferOne[3],
                originFarmName: resultBufferOne[4],
                originFarmInformation: resultBufferOne[5],
    
                originFarmLatitude: resultBufferTwo[2],
                originFarmLongitude: resultBufferTwo[3],
                productID: resultBufferTwo[4],
                productNotes: resultBufferTwo[5],
                productPrice: resultBufferTwo[6],
    
                itemState: resultBufferThree[2],
                distributorID: resultBufferThree[3],
                retailerID: resultBufferThree[4],
                consumerID: resultBufferThree[5]
            }; 
            console.log(`Fetch Result: ${JSON.stringify(App.item)}`);
            this.updateForm();
            this.updateUPCs();
            if (App.item.itemUPC == 0)
            {
                this.updateEventList("Fetch Data Failed: ", true, "Item not found" );
            }
            else
            {
                this.updateEventList("Fetch Data Returned: ", true, JSON.stringify(App.item) );
            }
        } catch (err) {
            console.log(`FetchData failed: ${err}`);
        }
    },

    fetchEvents: function () {
        if (typeof App.contracts.SupplyChain.currentProvider.sendAsync !== "function") {
            App.contracts.SupplyChain.currentProvider.sendAsync = function () {
                return App.contracts.SupplyChain.currentProvider.send.apply(
                App.contracts.SupplyChain.currentProvider,
                    arguments
              );
            };
        }

        App.contracts.SupplyChain.deployed().then(function(instance) {
        var events = instance.allEvents(function(err, log){
          if (!err)
            $("#ftc-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>');
        });
        }).catch(function(err) {
          console.log(err.message);
        });
        
    }
};

window.App = App;
window.addEventListener("load", async function() {
    if (window.ethereum) {
        // use MetaMask's provider
        App.web3 = new Web3(window.ethereum);
        await window.ethereum.enable(); // get permission to access accounts
    } else {
        console.warn("No web3 detected. Falling back to http://0.0.0.0:8545. You should remove this fallback when you deploy live",);
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        App.web3 = new Web3(new Web3.providers.HttpProvider("http://0.0.0.0:8545"),);
    }
});

$(function () {
    $(window).load(function () {
        App.init();
    });
});
