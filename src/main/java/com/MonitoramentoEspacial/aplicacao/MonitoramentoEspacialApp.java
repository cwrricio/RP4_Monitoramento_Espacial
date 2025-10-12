package com.MonitoramentoEspacial.aplicacao;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication(scanBasePackages = "com.MonitoramentoEspacial")
@EnableJpaRepositories(basePackages = "com.MonitoramentoEspacial.middleware")
@EntityScan(basePackages = "com.MonitoramentoEspacial.aplicacao.dominio")
public class MonitoramentoEspacialApp {
    public static void main(String[] args) {
        SpringApplication.run(MonitoramentoEspacialApp.class, args);
    }
}
