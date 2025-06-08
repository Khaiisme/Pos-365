import { useState, useRef, useEffect } from "react";
import React from "react";

const Modal = ({
  isOpen,
  onClose,
  tableName,
  orderItems,
  setOrderItems,
  setTables,
  addOrderItem,
  removeOrderItem,
  dishes,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDishes, setShowDishes] = useState(false); // To control the visibility of the filtered dishes
  const modalRef = useRef(null); // Reference for the modal
  const searchWrapperRef = useRef(null); // Reference for the search wrapper
  const [note, setNote] = useState(localStorage.getItem(tableName) || "");
  // Calculate the total
  const calculateTotal = () => {
    let total = 0;

    if (Array.isArray(orderItems)) {
      orderItems.forEach((item) => {
        total += parseFloat(item.price);
      });
    }

    return total.toFixed(2); // Returns a string like "20.00"
  };
  //   const calculateTotal = () => {
  //   const total = orderItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
  //   return total.toFixed(2);
  // };
  ///calculate the total price of checked items
  const [checkedItems, setCheckedItems] = useState({});
  const toggleChecked = (index) => {
    setCheckedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  let totalPrice = 0;

  if (Array.isArray(orderItems)) {
    orderItems.forEach((item, index) => {
      if (checkedItems[index]) {
        totalPrice += parseFloat(item.price);
      }
    });
  }


  // Filter dishes based on the search query
  const filteredDishes = dishes.filter((dish) =>
    dish.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowDishes(true); // Show dishes when the user starts typing
  };

  // Close the dropdown if clicking outside the search bar
  // useEffect(() => {
  //   const handleOutsideClick = (event) => {
  //     if (
  //       searchWrapperRef.current &&
  //       !searchWrapperRef.current.contains(event.target)
  //     ) {
  //       setShowDishes(false); // Hide the dropdown when clicking outside
  //     }
  //   };

  //   document.addEventListener("mousedown", handleOutsideClick);
  //   return () => {
  //     document.removeEventListener("mousedown", handleOutsideClick);
  //   };
  // }, []);

  // Handle double-click on an order item
  const [clickTimer, setClickTimer] = useState(null); // Timer to handle double click
  const handleItemClick = (index) => {
    if (clickTimer) {
      clearTimeout(clickTimer); // Clear the previous timeout
      setClickTimer(null); // Reset the timer
      // Remove item if double clicked
      removeOrderItem(index);
    } else {
      const newTimer = setTimeout(() => {
        setClickTimer(null); // Reset the timer after the timeout
      }, 300); // 300ms to detect double click
      setClickTimer(newTimer);
    }
  };
  let totalSales = parseFloat(localStorage.getItem("totalSales")) || 0; // Load from storage or set to 0
  // Handle the "Pay" button click
  const handlePay = () => {
    if (!tableName) {
      console.error("Table name is undefined!");
      return;
    }
    const totalBill = calculateTotal();
    totalSales += totalBill; // Add current bill to total sales
    totalSales = parseFloat(totalSales.toFixed(1)); // Ensure correct rounding

    localStorage.setItem("totalSales", totalSales); // Store in localStorage

    // Retrieve current orders from localStorage
    const storedOrders = JSON.parse(localStorage.getItem("orders")) || {};
    const storedNotes = JSON.parse(localStorage.getItem("notes")) || {};
    // Remove the specific table's order
    delete storedOrders[tableName];
    delete storedNotes[tableName];
    // Save updated orders back to localStorage
    localStorage.setItem("orders", JSON.stringify(storedOrders));
    localStorage.setItem("notes", JSON.stringify(storedNotes));
    // Clear order items in state
    setOrderItems([]);
    setNote("");

    // Remove "Abholung" table if it exists
    if (tableName.includes("Abholung")) {
      setTables((prevTables) =>
        prevTables.filter((table) => table !== tableName)
      );
    }

    // Close the modal
    onClose();
  };

  // Retrieve the stored note for this specific table from localStorage or use an empty string if no note is found


  useEffect(() => {
    if (tableName) {
      const storedNotes = JSON.parse(localStorage.getItem("notes")) || {};
      setNote(storedNotes[tableName] || ""); // Load the note for the selected table
    }
  }, [tableName]); // Runs when a new table is opened

  useEffect(() => {
    if (tableName) {
      const storedNotes = JSON.parse(localStorage.getItem("notes")) || {}; // Get all notes
      if (note.trim() === "") {
        delete storedNotes[tableName]; // Remove note if empty
      } else {
        storedNotes[tableName] = note; // Save note for the table
      }
      localStorage.setItem("notes", JSON.stringify(storedNotes));
    }
  }, [note, tableName]);

  return (
    isOpen && (
      <div className="text-xl fixed inset-0 bg-gray-400 bg-opacity-50 flex justify-center items-center z-50">
        <div
          ref={modalRef}
          className="bg-white p-6 rounded-lg w-full h-full sm:max-w-md sm:max-h-screen overflow-y-auto"
        >
          {/* Close button (X) */}
          <button
            onClick={() => {
              onClose();
            }}
            className="absolute mt-12 top-2 right-2 text-2xl font-bold text-white hover:text-gray-700"
          >
            X
          </button>

          <h2 className="text-3xl font-bold mb-4 mt-10">Tisch {tableName}</h2>

          {/* Search Bar */}
          <div className="mb-4 relative" ref={searchWrapperRef}>
            <input
              type="text"
              placeholder="Search for a dish..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
            {/* Display filtered dishes only if showDishes is true */}
            {showDishes && searchQuery && filteredDishes.length > 0 && (
              <div className="absolute left-0 right-0 max-h-48 overflow-y-auto bg-white border border-gray-300 rounded mt-1 z-10">
                {filteredDishes.map((dish, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => {
                      addOrderItem(dish.name, dish.price); // Add the item to the order
                      setShowDishes(false); // Close the dropdown
                      setSearchQuery(""); // Clear the search query
                    }}
                  >
                    <span>{dish.name}</span>
                    <span>{dish.price}€</span>
                  </div>
                ))}
              </div>
            )}

            {/* If no dishes match the search query, display a "No results" message */}
            {showDishes && searchQuery && filteredDishes.length === 0 && (
              <div className="absolute left-0 right-0 p-2 text-center text-gray-500">
                No results found
              </div>
            )}
          </div>

          {/* Note Box */}
          <div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)} // Update the note as the user types
              rows="1" // Only 1 line
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Write your note here..."
            ></textarea>
          </div>

          {/* Order Items */}
          <div className="mt-2 p-1 border border-gray-300 rounded-lg shadow-lg bg-white">
            {orderItems.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center px-2 py-1 border-b last:border-0 hover:bg-gray-100"
              >
                {/* Left: Checkbox + Item name */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!!checkedItems[index]}
                    onChange={() => toggleChecked(index)}
                    className="w-3 h-3"
                  />
                  <span className="font-semibold text-xl">{item.name}</span>
                </div>

                {/* Right: Price + Remove button */}
                <div className="flex items-center space-x-0">
                  <span className="text-xl text-black mr-1 ">{item.price}€</span>
                  <span
                    onClick={() => removeOrderItem(index)}
                    className="text-gray-700 text-xl p-0 leading-none "
                    style={{ background: 'none', border: 'none' }}
                  >
                    ✕
                  </span>
                </div>
              </div>
            ))}



          </div>
          {/* Total price of checked items */}
          {totalPrice > 0 && (
            <div className="mt-3 text-right font-bold text-lg text-green-700">
              Total of selected items: {totalPrice.toFixed(2)}€
            </div>
          )}

          {/* Total */}
          <div className="mt-4 font-bold bg-blue-300 w-full rounded-lg p-4">
            Insgesamt:<span className="text-2xl ml-20">{calculateTotal()}€</span>
          </div>

          {/* Pay Button */}
          <div className="bg-gray-600 mt-6">
            <button
              onClick={handlePay}
              className=" text-white text-4xl py-2 px-4 rounded-xl w-full"
            >
              Bezahlen
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default Modal;
