package vn.edu.stu.Sanemi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class SanemiApplication {

	public static void main(String[] args) {
		SpringApplication.run(SanemiApplication.class, args);
	}

}


