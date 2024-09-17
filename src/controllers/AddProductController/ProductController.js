// controllers/Product.js
const Product = require("../../models/ProductModel/Product");
const {BASEURL} = require('../../utils/Constants')
const fs = require("fs");

// Create a new Product

const LANGID = {
  1: "IND",
  2: "JPN",
  3: "KOR",
  4: "AUS",
};

exports.createProduct = async (req, res) => {

  try {
      const {
        name,
        subname,
        description,
        amount,
        offeramount,
        color,
        weight,
        dimensions,
        sku,
        availability,
        isActive,
        createdBy,
        category,
        lang,
        qty,
        exta_add_item
      } = req.body;
      console.log(req.file,req.files);
      // Assuming "images" is a file field in the form
      const imagePaths = req.files ? req.files.map(file => `${file.filename}`) : null;

      const newProduct = await Product.create({
          name,
          description,
          amount,
          offeramount,
          subname,
          imageUrl: req.fileUrls[0],
          color,
          weight,
          dimensions,
          sku,
          availability,
          isActive,
          createdBy,
          category,
          brand_id: "",
          lang,
          qty,
          exta_add_item,
          
      });

let data = JSON.stringify({
  "success": "1",
  "restaurants": [
    {
      "restaurantid": "xxxxx",
      "active": "1",
      "details": {
        "menusharingcode": "xxxxxx",
        "currency_html": "₹",
        "country": "India",
        "images": [],
        "restaurantname": "Heaven",
        "address": "nearsargasan,sghighway,Gandhinagar",
        "contact": "9998696995",
        "latitude": "23.190394",
        "longitude": "72.610591",
        "landmark": "",
        "city": "Ahmedabad",
        "state": "Gujarat",
        "minimumorderamount": "0",
        "minimumdeliverytime": "60Minutes",
        "deliverycharge": "50",
        "deliveryhoursfrom1": "",
        "deliveryhoursto1": "",
        "deliveryhoursfrom2": "",
        "deliveryhoursto2": "",
        "sc_applicable_on": "H,P,D",
        "sc_type": "2",
        "sc_calculate_on": "2",
        "sc_value": "5",
        "tax_on_sc": "1",
        "calculatetaxonpacking": 1,
        "pc_taxes_id": "11213,20375",
        "calculatetaxondelivery": 1,
        "dc_taxes_id": "11213,20375",
        "packaging_applicable_on": "ORDER",
        "packaging_charge": "20",
        "packaging_charge_type": ""
      }
    }
  ],
  "ordertypes": [
    {
      "ordertypeid": 1,
      "ordertype": "Delivery"
    },
    {
      "ordertypeid": 2,
      "ordertype": "PickUp"
    },
    {
      "ordertypeid": 3,
      "ordertype": "DineIn"
    }
  ],
  "categories": [
    {
      "categoryid": "500773",
      "active": "1",
      "categoryrank": "16",
      "parent_category_id": "0",
      "categoryname": "Pizzaandsides",
      "categorytimings": "",
      "category_image_url": ""
    },
    {
      "categoryid": "500774",
      "active": "1",
      "categoryrank": "17",
      "parent_category_id": "0",
      "categoryname": "Cakes",
      "categorytimings": "",
      "category_image_url": ""
    }
  ],
  "parentcategories": [],
  "items": [
    {
      "itemid": "118829149",
      "itemallowvariation": "0",
      "itemrank": "52",
      "item_categoryid": "500773",
      "item_ordertype": "1,2,3",
      "item_packingcharges": "",
      "itemallowaddon": "1",
      "itemaddonbasedon": "0",
      "item_favorite": "0",
      "ignore_taxes": "0",
      "ignore_discounts": "0",
      "in_stock": "2",
      "cuisine": [
        "Italian",
        "Mexican"
      ],
      "variation_groupname": "",
      "variation": [],
      "addon": [
        {
          "addon_group_id": "135699",
          "addon_item_selection_min": "0",
          "addon_item_selection_max": "1"
        },
        {
          "addon_group_id": "135707",
          "addon_item_selection_min": "0",
          "addon_item_selection_max": "4"
        }
      ],
      "itemname": "Veg Loaded Pizza",
      "item_attributeid": "1",
      "itemdescription": "",
      "minimumpreparationtime": "",
      "price": "100",
      "active": "1",
      "item_image_url": "",
      "item_tax": "11213,20375",
      "gst_type": "services",
      "nutrition": {
        "additiveMap": {
          "Polyols": {
            "amount": 1,
            "unit": "g"
          }
        },
        "allergens": [
          {
            "allergen": "gluten",
            "allergenDesc": "gluten"
          }
        ],
        "foodAmount": {
          "amount": 1,
          "unit": "g"
        },
        "calories": {
          "amount": 1,
          "unit": "kcal"
        },
        "protien": {
          "amount": 1,
          "unit": "g"
        },
        "minerals": [
          {
            "name": "a",
            "amount": 1,
            "unit": "g"
          }
        ],
        "sodium": {
          "amount": 1,
          "unit": "mg"
        },
        "carbohydrate": {
          "amount": 1,
          "unit": "g"
        },
        "totalSugar": {
          "amount": 1,
          "unit": "g"
        },
        "addedSugar": {
          "amount": 1,
          "unit": "g"
        },
        "totalFat": {
          "amount": 1,
          "unit": "g"
        },
        "saturatedFat": {
          "amount": 1,
          "unit": "g"
        },
        "transFat": {
          "amount": 1,
          "unit": "g"
        },
        "cholesterol": {
          "amount": 1,
          "unit": "g"
        },
        "vitamins": [
          {
            "name": "a",
            "amount": 1,
            "unit": "g"
          }
        ],
        "additionalInfo": {
          "info": "info",
          "remark": "remark"
        },
        "fiber": {
          "amount": 1,
          "unit": "g"
        },
        "servingInfo": "1to2people"
      }
    },
    {
      "itemid": "118807411",
      "itemallowvariation": "0",
      "itemrank": "53",
      "item_categoryid": "500774",
      "item_ordertype": "1,2,3",
      "item_packingcharges": "",
      "itemallowaddon": "0",
      "itemaddonbasedon": "0",
      "item_favorite": "0",
      "ignore_taxes": "0",
      "ignore_discounts": "0",
      "in_stock": "2",
      "cuisine": [],
      "variation_groupname": "",
      "variation": [],
      "addon": [],
      "itemname": "Chocolate cake",
      "item_attributeid": "1",
      "itemdescription": "",
      "minimumpreparationtime": "",
      "price": "310",
      "active": "1",
      "item_image_url": "",
      "item_tax": "21866,21867",
      "gst_type": "goods",
      "nutrition": {
        "calories": {
          "amount": 1,
          "unit": "kcal"
        },
        "protien": {
          "amount": 1,
          "unit": "g"
        },
        "sodium": {
          "amount": 1,
          "unit": "mg"
        },
        "carbohydrate": {
          "amount": 1,
          "unit": "g"
        },
        "totalSugar": {
          "amount": 1,
          "unit": "g"
        },
        "addedSugar": {
          "amount": 1,
          "unit": "g"
        },
        "servingInfo": "1to2people"
      }
    },
    {
      "itemid": "7765809",
      "itemallowvariation": "0",
      "itemrank": "52",
      "item_categoryid": "500773",
      "item_ordertype": "1,2,3",
      "item_packingcharges": "",
      "itemallowaddon": "0",
      "itemaddonbasedon": "0",
      "item_favorite": "0",
      "ignore_taxes": "0",
      "ignore_discounts": "0",
      "in_stock": "2",
      "cuisine": [],
      "variation_groupname": "",
      "variation": [
        {
          "id": "7765862",
          "variationid": "89058",
          "name": "3Pieces",
          "groupname": "Quantity",
          "price": "140",
          "active": "1",
          "item_packingcharges": "20",
          "variationrank": "1",
          "addon": [],
          "variationallowaddon": 0
        },
        {
          "id": "7765097",
          "variationid": "89059",
          "name": "6Pieces",
          "groupname": "Quantity",
          "price": "160",
          "active": "1",
          "item_packingcharges": "20",
          "variationrank": "3",
          "addon": [],
          "variationallowaddon": 0
        }
      ],
      "addon": [],
      "itemname": "Garlic Bread",
      "item_attributeid": "1",
      "itemdescription": "",
      "minimumpreparationtime": "",
      "price": "140",
      "active": "1",
      "item_image_url": "",
      "item_tax": "11213,20375",
      "gst_type": "services",
      "nutrition": {}
    }
  ],
  "variations": [
    {
      "variationid": "104220",
      "name": "Large",
      "groupname": "Quantity",
      "status": "1"
    },
    {
      "variationid": "104221",
      "name": "Small",
      "groupname": "Quantity",
      "status": "1"
    },
    {
      "variationid": "89058",
      "name": "3Pieces",
      "groupname": "Quantity",
      "status": "1"
    },
    {
      "variationid": "89059",
      "name": "6Pieces",
      "groupname": "Quantity",
      "status": "1"
    }
  ],
  "addongroups": [
    {
      "addongroupid": "135699",
      "addongroup_rank": "3",
      "active": "1",
      "addongroupitems": [
        {
          "addonitemid": "1150783",
          "addonitem_name": "Mojito",
          "addonitem_price": "0",
          "active": "1",
          "attributes": "1",
          "addonitem_rank": "1"
        },
        {
          "addonitemid": "1150784",
          "addonitem_name": "Hazelnut Mocha",
          "addonitem_price": "10",
          "active": "1",
          "attributes": "1",
          "addonitem_rank": "1"
        }
      ],
      "addongroup_name": "Add Beverage"
    },
    {
      "addongroupid": "135707",
      "addongroup_rank": "15",
      "active": "1",
      "addongroupitems": [
        {
          "addonitemid": "1150810",
          "addonitem_name": "Egg",
          "addonitem_price": "20",
          "active": "1",
          "attributes": "24",
          "addonitem_rank": "1"
        },
        {
          "addonitemid": "1150811",
          "addonitem_name": "Jalapenos",
          "addonitem_price": "20",
          "active": "1",
          "attributes": "1",
          "addonitem_rank": "1"
        },
        {
          "addonitemid": "1150812",
          "addonitem_name": "Onion Rings",
          "addonitem_price": "20",
          "active": "1",
          "attributes": "1",
          "addonitem_rank": "1"
        },
        {
          "addonitemid": "1150813",
          "addonitem_name": "Cheese",
          "addonitem_price": "10",
          "active": "1",
          "attributes": "1",
          "addonitem_rank": "1"
        }
      ],
      "addongroup_name": "Extra Toppings"
    }
  ],
  "attributes": [
    {
      "attributeid": "1",
      "attribute": "veg",
      "active": "1"
    },
    {
      "attributeid": "2",
      "attribute": "non-veg",
      "active": "1"
    },
    {
      "attributeid": "24",
      "attribute": "egg",
      "active": "1"
    }
  ],
  "discounts": [
    {
      "discountid": "363",
      "discountname": "Introductory Off",
      "discounttype": "1",
      "discount": "10",
      "discountordertype": "1,2,3",
      "discountapplicableon": "Items",
      "discountdays": "All",
      "active": "1",
      "discountontotal": "0",
      "discountstarts": "",
      "discountends": "",
      "discounttimefrom": "",
      "discounttimeto": "",
      "discountminamount": "",
      "discountmaxamount": "",
      "discounthascoupon": "0",
      "discountcategoryitemids": "7765809,7765862,7765097,118807411",
      "discountmaxlimit": ""
    }
  ],
  "taxes": [
    {
      "taxid": "11213",
      "taxname": "CGST",
      "tax": "2.5",
      "taxtype": "1",
      "tax_ordertype": "1,2,3",
      "active": "1",
      "tax_coreortotal": "2",
      "tax_taxtype": "1",
      "rank": "1",
      "consider_in_core_amount": "0",
      "description": ""
    },
    {
      "taxid": "20375",
      "taxname": "SGST",
      "tax": "2.5",
      "taxtype": "1",
      "tax_ordertype": "1,2,3",
      "active": "1",
      "tax_coreortotal": "2",
      "tax_taxtype": "1",
      "rank": "2",
      "consider_in_core_amount": "0",
      "description": ""
    },
    {
      "taxid": "21866",
      "taxname": "CGST",
      "tax": "9",
      "taxtype": "1",
      "tax_ordertype": "1",
      "active": "1",
      "tax_coreortotal": "2",
      "tax_taxtype": "1",
      "rank": "5",
      "consider_in_core_amount": "0",
      "description": ""
    },
    {
      "taxid": "21867",
      "taxname": "SGST",
      "tax": "9",
      "taxtype": "1",
      "tax_ordertype": "1",
      "active": "1",
      "tax_coreortotal": "2",
      "tax_taxtype": "1",
      "rank": "6",
      "consider_in_core_amount": "0",
      "description": ""
    }
  ],
  "serverdatetime": "2022-01-1811:33:13",
  "db_version": "1.0",
  "application_version": "4.0",
  "http_code": 200
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://private-anon-2e5cb1531c-onlineorderingapisv210.apiary-mock.com/pushmenu_endpoint',
  headers: { 
    'Content-Type': 'application/json', 
    'Cookie': 'ak_bmsc=DFFC3E1A6F2DD9FEFCF095CBECD23C98~000000000000000000000000000000~YAAQDiozapNTgRSRAQAAukinFxjYG5kaEIUJrNYSIZXJs5Kedb5cgY/z7n3cec6HlO/6vqT0K4M+VWL5YuE9ONw3WI3wnDfnE+NoS6HHM9f6/XZVdoJyRE7Ji9wcl7GzJy9P/LUi904Vnu6pndm12ntxkeWyXZC+QkTg9BAqN4DdCnYfQWHjEm0vKO7ovU8iP5KotNXKRFpBAftSxg1C7lzCqSXiljqP0kOIK3WmzZjYGQ/avNfhcxWpwCnjeTBpGtiptLUnuryc+qfe87EsFYUMO3i8XGSub0BD7AMaOfNERnZBDRvl2x488KczpDjc4Fv8OFgos4SkvtdfYDKwHZd2Bkzb6tivVG//AZlVogBYaJA6nghVYQfnWuRXQSCu; bm_sv=517C187FCA63EF98330D11E368F9AAB3~YAAQDiozaq1agRSRAQAAPNenFxiHeBmXEyXgtlwyKd3gz0pE9GfAhXkf7m3AHMCdk6fwAAwmaaAI4cw8x7v+uqgIVYCgX0lH3xBIQbJNTtjo98ujBNuOf5s2zUJ9+dVZHI9CCKiy4a/Je3nQiIJTGBKUtdcPVEdt7oUaFFccyos1A7E98sN9moQQmT7pSMolP33IzFhh8UudJgAtP35+SkhX8U1yyo6qYDEcN8xV0HgSFNrDcFHJjdMM71Q0Md1tesbXNJwd~1'
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});


      res.status(200).json({ success: true, product: newProduct });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
  }
}

exports.getAllProducts = async (req, res) => {
  const { lang } = req.query;

  // Validate 'lang' parameter
  if (!lang || !LANGID[lang]) {
    return res.status(400).json({ success: false, error: "Invalid 'lang' parameter" });
  }
 
  try {
    const products = await Product.find({ lang: LANGID[lang] });
   
   

    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};



// Get user-specific Products by language and search criteria
exports.getUserProducts = async (req, res) => {
  try {
    const { search } = req.query;
   

    const query = {
      isActive: true,  // Include only active products
      $or: [
        { name: { $regex: new RegExp(search, 'i') } },  // Case-insensitive search for name
        { description: { $regex: new RegExp(search, 'i') } },  // Case-insensitive search for description
      ],
    };
    const userProducts = await Product.find(query);
  //   const filePath = "/Users/admin/Documents/GitHub/local-heros-API/localheros.json"; // Path to the JSON file
    const productsToAdd = 
    [
      {
        "name": "Classic Mysore Biryani ",
        "description": "Our Classic Mysore biryani is an all time favourite across all age groups and classes!\r\nMysore style biryani is truly a delight to your taste buds with rich flavours and yet subtle. It's time to experience this wonderful curation handcrafted by our biryani heroes with premium ingredients like cold pressed oil, 18 months aged rice, organic vegetables, freshly pound secret masala and of course the traditional style of cooking.",
        "amount": 1799,
        "offeramount": 2000,
        "images": [
          "https://storage.googleapis.com/email-js-1a09b.appspot.com/localHeros/1725271619794-931995856"
        ],
        "color": "Red",
        "weight": "1.5 kg",
        "dimensions": "10x5x2 inches",
        "sku": "BOX123",
        "availability": "In Stock",
        "qty": 5,
        "isActive": true,
        "createdBy": "66ab686411efc2d6df034a93",
        "category": "66e740d9f29a48c81409cf24",
        "lang": "IND",
        "createdAt": "2024-02-26T05:54:25.860Z",
        "exta_add_item": "250",
        "subname": "",
        "options": true,
        "is_type": "Non Veg"
      },
      {
        "name": "Epic Bangalore Biryani",
        "description": "Experience the bangalore style Biryani which was cherished by the old bangaloreans from the old times!\r\nDum cooked to perfection, a time honored tradition, handcrafted  by our biryani heroes ensuring each fluffy grain of rice is infused with aromatic spices.\r\nWe at local heros make this biryani tastier and healthier by using finest premium ingredients like cold-pressed groundnut oil, 18-month aged Seeraga Samba rice, organic vegetables, and  freshly pounded masala.",
        "amount": 1799,
        "offeramount": 2000,
        "images": [
          "https://storage.googleapis.com/email-js-1a09b.appspot.com/localHeros/1725280445558-979247153"
        ],
        "color": "Red",
        "weight": "1.5 kg",
        "dimensions": "10x5x2 inches",
        "sku": "ABC123",
        "availability": "In Stock",
        "qty": 5,
        "isActive": true,
        "createdBy": "66ab686411efc2d6df034a93",
        "category": "66e740d9f29a48c81409cf24",
        "lang": "IND",
        "createdAt": "2024-02-26T05:58:04.645Z",
        "exta_add_item": "250",
        "subname": "",
        "options": true,
        "is_type": "Non Veg"
      },
      {
        "name": "Chicken 65 Boneless Biryani ",
        "description": "Our Chicken 65 Boneless Biryani is a modern twist on the classic, perfect for busy lifestyles!\nThis dum-cooked biryani features juicy, boneless \"special chicken\" nestled amidst fluffy Seeraga Samba rice with fragrant spices that will excite your taste buds. It's time to experience this wonderful curation handcrafted by our biryani heros with premium ingredients like cold pressed oil, 18 months aged rice, organic vegetables, freshly pound secret masala and of course the traditional style of cooking.",
        "subname": "",
        "amount": 1799,
        "offeramount": 2000,
        "images": [
          "https://storage.googleapis.com/email-js-1a09b.appspot.com/localHeros/1725271662467-363256590"
        ],
        "color": "RED",
        "weight": "500g",
        "dimensions": "10x15",
        "sku": "EP-11233444",
        "availability": "In Stock",
        "qty": 200,
        "isActive": true,
        "createdBy": "66ab686411efc2d6df034a93",
        "category": "66e740d9f29a48c81409cf24",
        "lang": "IND",
        "exta_add_item": "250",
        "createdAt": "2024-04-06T11:14:28.409Z",
        "options": false,
        "is_type": "Non Veg"
      },
      {
        "name": "Hyderabadi Biryani",
        "description": "Hailing from the opulent kitchens of the Nizams and all time favourite, this aromatic rice dish is a harmonious blend of fragrant basmati rice, cold-pressed oil, organic vegetables, freshly pound secret masala and of course the traditional style of cooking.  Prepared with meticulous care by our Biryani Heros and slow-cooked to perfection, each mouthful transports you to the grandeur of the bygone era.\r\n",
        "subname": "",
        "amount": 1799,
        "offeramount": 2000,
        "images": [
          "https://storage.googleapis.com/email-js-1a09b.appspot.com/localHeros/1725280487631-215142924"
        ],
        "color": "RED",
        "weight": "500 gms",
        "dimensions": "10x15",
        "sku": "HB-11233444",
        "availability": "In Stock",
        "qty": 200,
        "isActive": true,
        "createdBy": "66ab686411efc2d6df034a93",
        "category": "66e740d9f29a48c81409cf24",
        "lang": "IND",
        "exta_add_item": "250",
        "options": false,
        "createdAt": "2024-07-16T07:56:27.177Z",
        "is_type": "Non Veg"
      },
      {
        "name": "Aloo 65 Biryani",
        "description": "Taste a fiery twist on the classic biryani with our Aloo 65 Biryani. Crispy, flavorful potato cubes, marinated in a spicy blend of Indian spices, are perfectly combined with our aromatic biryani rice. Made with premium ingredients like cold pressed oil, 18 months aged rice, organic vegetables, freshly pound secret masala and of course the traditional style of cooking. Every bite is a burst of flavor, with the spicy kick of the aloo 65 complementing the rich, fragrant rice.\n",
        "subname": "",
        "amount": 1799,
        "offeramount": 2000,
        "images": [
          "https://storage.googleapis.com/email-js-1a09b.appspot.com/localHeros/1724999713221-773963164"
        ],
        "color": "RED",
        "weight": "500 gms",
        "dimensions": "10x15",
        "sku": "VBY-1236",
        "availability": "In Stock",
        "qty": 200,
        "isActive": true,
        "createdBy": "66ab686411efc2d6df034a93",
        "category": "66e740d9f29a48c81409cf24",
        "lang": "IND",
        "exta_add_item": "250",
        "options": false,
        "createdAt": "2024-07-16T08:01:08.765Z",
        "is_type": "Veg"
      },
      {
        "name": "Mushroom Biryani",
        "description": "Savour the earthy richness of our Mushroom Biryani, Our biryani , infused with the essence of the mushrooms, offers a delightful contrast of textures and tastes. A perfect choice for those seeking a meat-free option without compromising on flavour. Made with premium ingredients like cold-pressed oil, 18 months aged rice, organic vegetables, freshly pounded secret masala and of course the traditional style of cooking.\n",
        "subname": "",
        "amount": 1799,
        "offeramount": 2000,
        "images": [
          "https://storage.googleapis.com/email-js-1a09b.appspot.com/localHeros/1724999851376-223567470"
        ],
        "color": "RED",
        "weight": "500 gms",
        "dimensions": "10x15",
        "sku": "RB-1233445",
        "availability": "In Stock",
        "qty": 200,
        "isActive": true,
        "createdBy": "66ab686411efc2d6df034a93",
        "category": "66e740d9f29a48c81409cf24",
        "lang": "IND",
        "exta_add_item": "250",
        "options": false,
        "createdAt": "2024-07-16T09:41:03.564Z",
        "is_type": "Veg"
      },
      {
        "name": "Paneer 65 Biryani",
        "description": "Experience a fiery fusion of flavours with our Paneer 65 Biryani. This unique dish combines the irresistible crunch of Paneer 65 with the aromatic essence of our biryani. Made with premium ingredients like cold pressed oil, 18 months aged rice, organic vegetables, freshly pound secret masala. Each spoonful is a tantalizing journey through a symphony of spicy, tangy, and fragrant notes. \n",
        "subname": "",
        "amount": 1799,
        "offeramount": 2000,
        "images": [
          "https://storage.googleapis.com/email-js-1a09b.appspot.com/localHeros/1725002427781-782369761"
        ],
        "color": "RED",
        "weight": "500 gms",
        "dimensions": "12.7 × 9.3 × 0.6 cm",
        "sku": "BY-11233444",
        "availability": "In Stock",
        "qty": 200,
        "isActive": true,
        "createdBy": "66ab686411efc2d6df034a93",
        "category": "66e740d9f29a48c81409cf24",
        "lang": "IND",
        "exta_add_item": "250",
        "options": false,
        "createdAt": "2024-07-16T09:45:51.235Z",
        "is_type": "Veg"
      },
      {
        "name": "Anda Biryani",
        "description": "This classic Indian dish features tender, boiled eggs nestled amidst fragrant biryani rice, infused with a symphony of aromatic spices. Each bite is a delightful surprise, as the savory egg complements the rich and flavorful rice. Our Anda Biryani is a must-try for egg lovers and biryani enthusiasts alike prepared with premium ingredients like cold pressed oil, 18-months aged Seeraga Samba rice, organic vegetables, and freshly pounded masala.\n",
        "amount": 1799,
        "offeramount": 2000,
        "images": [
          "https://storage.googleapis.com/email-js-1a09b.appspot.com/localHeros/1725002979439-221659201"
        ],
        "color": "Red",
        "weight": "1.5 kg",
        "dimensions": "10x5x2 inches",
        "sku": "BOX124",
        "availability": "In Stock",
        "qty": 5,
        "isActive": true,
        "createdBy": "66ab686411efc2d6df034a93",
        "category": "66e740d9f29a48c81409cf24",
        "lang": "IND",
        "createdAt": "2024-02-26T05:54:25.860Z",
        "exta_add_item": "250",
        "subname": "",
        "options": true,
        "is_type": "Non Veg"
      }
    ];

  //   // Read JSON data from the file
  //   const rawData = fs.readFileSync(filePath);
  //     const productsData = JSON.parse(rawData); // Parse JSON data
  //     for (let index = 0; index < productsData.length; index++) {
  //     const element = productsData[index];
  //     delete element._id;
  //     console.log(element);
  //     productsToAdd.push(element);
  //   }
  
  // const insertedProducts = await Product.insertMany(productsToAdd);

    res.status(200).json({ success: true, userProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};


// Get a specific Product by ID
exports.getProductById = async (req, res) => {
  try {
    const ProductId = req.params.id;
    const Products = await Product.findById(ProductId);

    if (!Products) {
      return res
        .status(404)
        .json({ success: false, message: "Products not found" });
    }

    res.status(200).json({ success: true, Products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Update a specific Product by ID
exports.updateProductById = async (req, res) => {
    try {
      const ProductId = req.params.id;
      const {
        name,
        description,
        amount,
        offeramount,
        color,
        weight,
        dimensions,
        sku,
        availability,
        isActive,
        createdBy,
        category,
        lang,
        brand_id,
        qty,
        subname,
        exta_add_item,
        is_type
      } = req.body;
  
      // Check if the Product exists
      const existingProduct = await Product.findById(ProductId);
  
      if (!existingProduct) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      const imagePaths = req.files ? req.files.map(file => `${file.filename}`) : null;

      // Update the Product fields
      existingProduct.name = name;
      existingProduct.subname = subname;
      existingProduct.description = description;
      existingProduct.amount = amount;
      existingProduct.offeramount = offeramount;
      // existingProduct.images = req.fileUrls[0];
      existingProduct.color = color;
      existingProduct.weight = weight;
      existingProduct.dimensions = dimensions;
      existingProduct.sku = sku;
      existingProduct.availability = availability;
      existingProduct.isActive = isActive;
      existingProduct.createdBy = createdBy;
      existingProduct.category = category;
      existingProduct.brand_id = brand_id;
      existingProduct.lang = lang;
      existingProduct.qty = qty;
      existingProduct.exta_add_item = exta_add_item;
      existingProduct.is_type = is_type;

      // Save the updated Product
      const updatedProduct = await existingProduct.save();
  
      res.status(200).json({ success: true, product: updatedProduct });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  };
  

// Delete a specific Product by ID
exports.deleteProductById = async (req, res) => {
  try {
    const ProductId = req.params.id;

    // Check if the Product exists
    const existingProduct = await Product.findById(ProductId);

    if (!existingProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Remove the Product from the database
    await Product.deleteOne({ _id: ProductId });

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
