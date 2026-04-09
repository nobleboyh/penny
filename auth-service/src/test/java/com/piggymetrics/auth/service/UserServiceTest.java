package com.piggymetrics.auth.service;

import com.piggymetrics.auth.domain.User;
import com.piggymetrics.auth.repository.UserRepository;
import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.mockito.MockitoAnnotations.initMocks;

public class UserServiceTest {

	@InjectMocks
	private UserServiceImpl userService;

	@Mock
	private UserRepository repository;

	@Before
	public void setup() {
		initMocks(this);
	}

	@Test
	public void shouldCreateUser() {

		User user = new User();
		user.setUsername("name");
		user.setPassword("password");
		user.setAgeConfirmed(true);

		userService.create(user);
		verify(repository, times(1)).save(user);
	}

	@Test(expected = IllegalArgumentException.class)
	public void shouldFailWhenUserAlreadyExists() {

		User user = new User();
		user.setUsername("name");
		user.setPassword("password");
		user.setAgeConfirmed(true);

		when(repository.findById(user.getUsername())).thenReturn(Optional.of(new User()));
		userService.create(user);
	}

	@Test(expected = IllegalArgumentException.class)
	public void shouldFailWhenAgeNotConfirmed() {

		User user = new User();
		user.setUsername("name");
		user.setPassword("password");
		// ageConfirmed defaults to false

		userService.create(user);
	}
}
