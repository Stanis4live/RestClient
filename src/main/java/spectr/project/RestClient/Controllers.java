package spectr.project.RestClient;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class Controllers {

    @GetMapping("/register")
    public String registerPage(){
        return "redirect:/register.html";
    }

    @GetMapping("/login")
    public String loginPage(){
        return "redirect:/login.html";
    }
}
