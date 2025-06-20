// EditCardForm Component
// in: Uses URL parameters (cardSlug), React context (CardsContext) for card data and update function, and Cookies for user info.
// out: Renders a form for editing an existing card. Handles field validation, image upload, and submission of updated card data.
// Additional: Typically used on the card editing page, ensuring only authorized users (role "user") can access it.

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { CardsContext } from '../../contexts/CardsContext';
import { USER_ROLES } from '../../constants'; // <--- import roles constant
import "./EditCardForm.css";

const EditCardForm = () => {
  const { cardSlug } = useParams();
  const { cards, updateCard } = useContext(CardsContext);
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
        if (userData.role !== USER_ROLES.USER) { // <--- use constant
          navigate("/");
        }
      } catch (error) {
        console.error("Error parsing user cookie:", error);
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (cards.length > 0) {
      const foundCard = cards.find(card => card.slug === cardSlug);
      if (foundCard) {
        setFullName(foundCard.fullName);
        setEmail(foundCard.email || "");
        setPhoneNumber(foundCard.phoneNumber);
        setCity(foundCard.city);
        setStreet(foundCard.street);
        setTitle(foundCard.title);
        setDescription(foundCard.description);
      }
    }
  }, [cards, cardSlug]);

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
      image: (image || (cards.find(card => card.slug === cardSlug)?.image)) ? "" : "Image is required",
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

    if (image) {
      formData.append('image', image);
    }

    try {
      await updateCard(cardSlug, formData);
      navigate("/");
    } catch (error) {
      console.error("Error updating card:", error);
      alert("There was an error updating the card. Please try again.");
    }
  };

  const cardToEdit = cards.find(card => card.slug === cardSlug);

  return (
    <div className="edit-card-form-container">
      <h2>Edit Card</h2>
      {cards.length === 0 ? (
        <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
      ) : cardToEdit ? (
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="edit-card-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name:</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
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
            <label htmlFor="phoneNumber">Phone Number:</label>
            <input
              id="phoneNumber"
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="city">City:</label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            {errors.city && <span className="error-message">{errors.city}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="street">Street:</label>
            <input
              id="street"
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              required
            />
            {errors.street && <span className="error-message">{errors.street}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="title">Title:</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              required
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="image">Image:</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {errors.image && <span className="error-message">{errors.image}</span>}
            {!image && cardToEdit.image && (
              <div className="current-image">
                <p>Current image:</p>
                <img
                  src={`data:image/jpeg;base64,${cardToEdit.image}`}
                  alt="Current"
                  style={{ width: '100px', height: 'auto' }}
                />
              </div>
            )}
          </div>
          <button type="submit" className="submit-button">Update Card</button>
        </form>
      ) : (
        <div style={{ padding: "2rem", textAlign: "center" }}>Card not found</div>
      )}
    </div>
  );
};

export default EditCardForm;
