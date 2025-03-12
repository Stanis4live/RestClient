package spectr.project.RestClient;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class Controllers {

    @GetMapping("/register")
    public String registerPage(){
        return "register";
    }

    @GetMapping("/login")
    public String loginPage(){
        return "login";
    }

    @GetMapping("/home")
    public String homePage(){
        return "home";
    }

    @GetMapping("/events")
    public String eventsPage(){
        return "events";
    }

    @GetMapping("/one-event")
    public String oneEventPage(){
        return "one-event";
    }
}
