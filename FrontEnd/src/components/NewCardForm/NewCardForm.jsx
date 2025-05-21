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
import { CardsContext } from '../../CardsContext';
import "./NewCardForm.css";

const NewCardForm = () => {

  // in: Retrieves the addCard function from CardsContext.
  // out: Allows the component to create a new card entry.
  const { addCard } = useContext(CardsContext);

  // in: useNavigate hook for programmatic navigation.
  // out: Enables redirection after successful card creation.
  const navigate = useNavigate();

  // in: Initializes state for each input field and error messages.
  // out: Manages the input values and form validation errors.
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

  // in: Executes once on component mount (and whenever navigate changes).
  // out: Validates the user's role using cookies; if the user role is not "user", navigates to the home page.
  // Additional: Prevents unauthorized users from accessing the new card form.
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

  // in: Event object from the file input change event.
  // out: Updates the 'image' state with the selected file.
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // in: Event object from the title input change event.
  // out: Updates the 'title' state and validates that the title is not empty,
  //      updating the errors state accordingly.
  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    if (value.trim() === "") {
      setErrors(prev => ({ ...prev, title: "Title is required" }));
    } else {
      setErrors(prev => ({ ...prev, title: "" }));
    }
  };

  // in: Form submission event.
  // out: Validates all required fields, constructs a FormData object for a multipart/form-data submission,
  //      calls addCard to create the new card, and navigates to the home page upon success.
  // Additional: Prevents submission if any required fields are missing and displays appropriate error messages.
  const handleSubmit = async (e) => {
    e.preventDefault();

    // in: Validates each input field.
    // out: Constructs an errors object with messages for empty fields.
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

    // in: Constructs a FormData object containing all form field values.
    // out: Prepares the data for a multipart/form-data HTTP request.
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('phoneNumber', phoneNumber);
    formData.append('city', city);
    formData.append('street', street);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('image', image);

    try {
      // in: Calls the addCard function from CardsContext with formData.
      // out: Attempts to create a new card in the backend.
      await addCard(formData);

      // in: After successful card creation.
      // out: Navigates to the home page.
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