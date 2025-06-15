// NewCardForm Component
// in: No props are passed to this component.
//     Uses React hooks (useState, useContext, useEffect) to manage local state,
//     and React Router's useNavigate for redirection.
//     It also uses js-cookie to validate the current user's role.
// out: Renders a form for creating a new card, including fields for personal and card information,
//      handles form validation and submission, and calls the addCard function from CardsContext.
// Additional: This component is typically used on a page where authenticated users (role "user") can create a new card.

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { CardsContext } from '../../contexts/CardsContext';
import { USER_ROLES } from '../../constants'; // Add this import!
import "./NewCardForm.css";

const NewCardForm = () => {
  const { addCard } = useContext(CardsContext);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    city: "",
    street: "",
    title: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    const storedUser = Cookies.get('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.role !== USER_ROLES.USER) { // Use constant
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

    const newErrors = {
      fullName: fullName.trim() === "" ? "Full Name is required" : "",
      email: email.trim() === "" ? "Email is required" : "",
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

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('phoneNumber', phoneNumber);
    formData.append('city', city);
    formData.append('street', street);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('image', image);

    try {
      await addCard(formData);
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
          <label htmlFor="email">Email:<span className="required-asterisk">*</span></label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
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
