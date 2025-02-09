<script lang="ts">
	import { goto } from '$app/navigation';
	import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
	import { firebaseAuth } from '$lib/firebase';

	let email = '';
	let password = '';

	let showSuccessMessage = false;
	let success: boolean | undefined = undefined;
	let errorMessage: string = '';

	const register = () => {
		createUserWithEmailAndPassword(firebaseAuth, email, password)
			.then(() => {
				showSuccessMessage = true;
				setTimeout(() => {
					togglePanel(false);
				}, 3000);
			})
			.catch((error) => {
				const errorCode = error.code;
				errorMessage = error.message;
				console.log(errorCode, errorMessage);

				success = false;
			});
	};

	const login = () => {
		signInWithEmailAndPassword(firebaseAuth, email, password)
			.then(() => {
				goto('/main'); //main page
			})
			.catch((error) => {
				const errorCode = error.code;
				errorMessage = error.message;
				console.log(errorCode, errorMessage);

				success = false;
			});
	};

	let rightPanelActive = false;

	const togglePanel = (activate: boolean): void => {
		rightPanelActive = activate;
	};
</script>

<div class="container" class:right-panel-active={rightPanelActive}>
	<div class="form-container sign-up-container">
		<form on:submit|preventDefault={register}>
			
			<h1>Create Account</h1>
			<div class="social-container">
				<a href="null" class="social" aria-label="Sign up with Facebook"
					><i class="fab fa-facebook-f"></i></a
				>
				<a href="null" class="social" aria-label="Sign up with Google"
					><i class="fab fa-google-plus-g"></i></a
				>
				<a href="null" class="social" aria-label="Sign up with LinkedIn"
					><i class="fab fa-linkedin-in"></i></a
				>
			</div>
			<span>or use your email for registration</span>
			<input type="text" placeholder="Name" required />
			<input type="email" placeholder="Email" required bind:value={email} />
			<input type="password" placeholder="Password" required bind:value={password} />
			<button type="submit">Sign Up</button>
			{#if !success && success !== undefined}
				<div class="error-message">
					There was an error registering. Please try again.
				</div>
			{/if}
			{#if showSuccessMessage}
				<p class:visible={showSuccessMessage}>Successfully signed up!</p>
			{/if}
		</form>
	</div>
	<div class="form-container sign-in-container">
		<form on:submit|preventDefault={login}>
			<h1>Sign in</h1>
			<div class="social-container">
				<a href="null" class="social" aria-label="Sign in with Facebook"
					><i class="fab fa-facebook-f"></i></a
				>
				<a href="null" class="social" aria-label="Sign in with Google"
					><i class="fab fa-google-plus-g"></i></a
				>
				<a href="null" class="social" aria-label="Sign in with LinkedIn"
					><i class="fab fa-linkedin-in"></i></a
				>
			</div>
			<span>or use your account</span>
			<input type="email" placeholder="Email" required bind:value={email} />
			<input type="password" placeholder="Password" required bind:value={password} />
			<a href="null">Forgot your password?</a>
			<button type="submit">Sign In</button>
			{#if !success && success !== undefined}
				<div class="error-message">
					Incorrect username or password.
					<!-- <p> {errorMessage} </p> -->
				</div>
			{/if}
		</form>
	</div>
	<div class="overlay-container">
		<div class="overlay">
			<div class="overlay-panel overlay-left">
				<h1>Welcome Back!</h1>
				<p>To keep connected with us please login with your personal info</p>
				<button class="ghost" on:click={() => togglePanel(false)}>Sign In</button>
			</div>
			<div class="overlay-panel overlay-right">
				<h1>Let's start journaling</h1>
				<img src="/journaling.gif" alt="Welcome GIF" class="gif" />
				<p>Enter your personal details and start your journey with us</p>
				<button class="ghost" on:click={() => togglePanel(true)}>Sign Up</button>
			</div>
		</div>
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css?family=Montserrat:400,800');

	* {
		box-sizing: border-box;
	}

	:global(body) {
		background: #f6f5f7;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		font-family: 'Montserrat', sans-serif;
		height: 100vh;
		margin: -20px 0 50px;
	}

	h1 {
		font-weight: bold;
		margin: 0;
	}

	p {
		font-size: 14px;
		font-weight: 100;
		line-height: 20px;
		letter-spacing: 0.5px;
		margin: 20px 0 30px;
	}

	span {
		font-size: 12px;
	}

	a {
		color: #333;
		font-size: 14px;
		text-decoration: none;
		margin: 15px 0;
	}

	button {
		border-radius: 20px;
		border: 1px solid #ff4b2b;
		background-color: #ff4b2b;
		color: #ffffff;
		font-size: 12px;
		font-weight: bold;
		padding: 12px 45px;
		letter-spacing: 1px;
		text-transform: uppercase;
		transition: transform 80ms ease-in;
	}

	button:active {
		transform: scale(0.95);
	}

	button:focus {
		outline: none;
	}

	button.ghost {
		background-color: transparent;
		border-color: #ffffff;
	}

	form {
		background-color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		padding: 0 50px;
		height: 100%;
		text-align: center;
	}

	input {
		background-color: #eee;
		border: none;
		padding: 12px 15px;
		margin: 8px 0;
		width: 100%;
	}

	.container {
		background-color: #fff;
		border-radius: 10px;
		box-shadow:
			0 14px 28px rgba(0, 0, 0, 0.25),
			0 10px 10px rgba(0, 0, 0, 0.22);
		position: relative;
		overflow: hidden;
		width: 768px;
		max-width: 100%;
		min-height: 480px;
	}

	.form-container {
		position: absolute;
		top: 0;
		height: 100%;
		transition: all 0.6s ease-in-out;
	}

	.sign-in-container {
		left: 0;
		width: 50%;
		z-index: 2;
	}

	.container.right-panel-active .sign-in-container {
		transform: translateX(100%);
	}

	.sign-up-container {
		left: 0;
		width: 50%;
		opacity: 0;
		z-index: 1;
	}

	.container.right-panel-active .sign-up-container {
		transform: translateX(100%);
		opacity: 1;
		z-index: 5;
		animation: show 0.6s;
	}

	@keyframes show {
		0%,
		49.99% {
			opacity: 0;
			z-index: 1;
		}

		50%,
		100% {
			opacity: 1;
			z-index: 5;
		}
	}

	.overlay-container {
		position: absolute;
		top: 0;
		left: 50%;
		width: 50%;
		height: 100%;
		overflow: hidden;
		transition: transform 0.6s ease-in-out;
		z-index: 100;
	}

	.container.right-panel-active .overlay-container {
		transform: translateX(-100%);
	}

	.overlay {
		background: #ff416c;
		background: -webkit-linear-gradient(to right, #ff4b2b, #ff416c);
		background: linear-gradient(to right, #ff4b2b, #ff416c);
		background-repeat: no-repeat;
		background-size: cover;
		background-position: 0 0;
		color: #ffffff;
		position: relative;
		left: -100%;
		height: 100%;
		width: 200%;
		transform: translateX(0);
		transition: transform 0.6s ease-in-out;
	}

	.container.right-panel-active .overlay {
		transform: translateX(50%);
	}

	.overlay-panel {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		padding: 0 40px;
		text-align: center;
		top: 0;
		height: 100%;
		width: 50%;
		transform: translateX(0);
		transition: transform 0.6s ease-in-out;
	}

	.overlay-left {
		transform: translateX(-20%);
	}

	.container.right-panel-active .overlay-left {
		transform: translateX(0);
	}

	.overlay-right {
		right: 0;
		transform: translateX(0);
	}

	.container.right-panel-active .overlay-right {
		transform: translateX(20%);
	}

	.social-container {
		margin: 20px 0;
	}

	.social-container a {
		border: 1px solid #dddddd;
		border-radius: 50%;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		margin: 0 5px;
		height: 40px;
		width: 40px;
	}

	.overlay-panel img.gif {
		max-width: 60%; /* Ensures the GIF scales within its container */
		height: auto; /* Maintains the aspect ratio */
		margin-bottom: 0px; /* Adds spacing below the GIF */
	}

	@media (max-width: 768px) {
		.overlay-panel img.gif {
			max-width: 80%; /* Adjust the width for smaller screens */
			margin-bottom: 15px;
		}
	}
	.overlay-panel p {
		opacity: 0;
		transition: opacity 0.5s ease-in-out;
	}

	.error-message {
		background-color: #ffe6e6; /* Light red background */
		color: #d9534f; /* Red text color */
		/* padding: 16px;  Add some padding */
		/* border: 1px solid #d9534f;  Red border */
		border-radius: 4px; /* Rounded corners */
		font-size: 14px; /* Adjust font size */
		margin: 16px 0; /* Add space around the message */
	}
</style>
