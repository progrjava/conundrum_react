import React from 'react';
import SignUpField from './SignUpField';
import SignInField from './SignInField';
import '../css/signInUp.css';

const SignInUp = ({ supabase }) => {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [isRegistrationProcess, setIsRegistrationProcess] = React.useState(true);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const switchLoginProcess = () => {
    setIsRegistrationProcess(!isRegistrationProcess);
  };

  return (
    <main className='sign-in-up-wrapper'>
      <div className="background-video-main"/>
      <div className="ellipse-bg"></div>
      {isRegistrationProcess ? (
        <SignUpField 
          isPasswordVisible={isPasswordVisible}
          togglePasswordVisibility={togglePasswordVisibility}
          switchLoginProcess={switchLoginProcess}
          supabase={supabase}
        />
      ) : (
        <SignInField
          isPasswordVisible={isPasswordVisible}
          togglePasswordVisibility={togglePasswordVisibility}
          switchLoginProcess={switchLoginProcess}
          supabase={supabase}
        />
      )}
    </main>
  );
};

export default SignInUp;