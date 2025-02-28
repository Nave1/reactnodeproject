// src/components/NewCardForm/NewCardForm.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { CardsContext } from '../../CardsContext';
import "./NewCardForm.css"; // Make sure this file exists

const NewCardForm = () => {
  const { addCard } = useContext(CardsContext);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const [errors, setErrors] = useState({
    fullName: "",
    phoneNumber: "",
    city: "",
    street: "",
    title: "",
    description: "",
    image: "",
  });

  // Validate user role
  useEffect(() => {
    const storedUser = Cookies.get('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.role !== "user") {
          navigate("/");
        }
      } catch (error) {
        console.error("Error parsing user cookie:", error);
      }
    }
  }, [navigate]);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    if (value.trim() === "") {
      setErrors(prev => ({ ...prev, title: "Title is required" }));
    } else {
      setErrors(prev => ({ ...prev, title: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    const newErrors = {
      fullName: fullName.trim() === "" ? "Full Name is required" : "",
      phoneNumber: phoneNumber.trim() === "" ? "Phone Number is required" : "",
      city: city.trim() === "" ? "City is required" : "",
      street: street.trim() === "" ? "Street is required" : "",
      title: title.trim() === "" ? "Title is required" : "",
      description: description.trim() === "" ? "Description is required" : "",
      image: !image ? "Image is required" : "",
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some(err => err !== "")) {
      return;
    }

    // Create FormData object for multipart/form-data submission
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('phoneNumber', phoneNumber);
    formData.append('city', city);
    formData.append('street', street);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('image', image);

    try {
      // Call the addCard function from context
      await addCard(formData);

      // Navigate to the home page after successful card creation
      navigate("/");
    } catch (error) {
      console.error("Error creating card:", error);
      alert("There was an error creating the card. Please try again.");
    }
  };

  return (
    <div className="new-card-form-container">
      <h2>Create New Card</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="new-card-form">
        <div className="form-group">
          <label htmlFor="fullName">Full Name:<span className="required-asterisk">*</span></label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className={errors.fullName ? "input-error" : ""}
          />
          {errors.fullName && <span className="error-message">{errors.fullName}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number:<span className="required-asterisk">*</span></label>
          <input
            id="phoneNumber"
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            className={errors.phoneNumber ? "input-error" : ""}
          />
          {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="city">City:<span className="required-asterisk">*</span></label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className={errors.city ? "input-error" : ""}
          />
          {errors.city && <span className="error-message">{errors.city}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="street">Street:<span className="required-asterisk">*</span></label>
          <input
            id="street"
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            required
            className={errors.street ? "input-error" : ""}
          />
          {errors.street && <span className="error-message">{errors.street}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="title">Title:<span className="required-asterisk">*</span></label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={handleTitleChange}
            required
            className={errors.title ? "input-error" : ""}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="description">Description:<span className="required-asterisk">*</span></label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className={errors.description ? "input-error" : ""}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="image">Image:<span className="required-asterisk">*</span></label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
            className={errors.image ? "input-error" : ""}
          />
          {errors.image && <span className="error-message">{errors.image}</span>}
        </div>
        <div className="form-group">
          <button type="submit" className="submit-button">Create Card</button>
        </div>
      </form>
    </div>
  );
};

export default NewCardForm;