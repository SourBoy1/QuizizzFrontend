export const emailRegexValidation = (email) => {
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/;

  return emailRegex.test(email);
};

export const usernameRegexValidation = (username) => {
  const usernameRegex = /^\w{1,}$/g;

  return usernameRegex.test(username);
};

export const phoneNumberValidation = (number) => {
  const phoneNumberRegex = /^(\+\d{1,2}\s*)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,6}$/gm;

  return phoneNumberRegex.test(number);
};

export const phoneNumberValidationWithoutCountryCode = (number) => {
  const regex = /^[0-9]{9,12}$/;
  return regex.test(number);
};
