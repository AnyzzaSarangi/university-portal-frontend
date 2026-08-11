import java.sql.*;
public class Crud{
    public static void main(String[] args){
        Connection cn = null;
        Statement st = null;
        try{
            Class cc = Class.forName("com.mysql.cj.jdbc.Driver");
            cc.newInstance();
            cn = DriverManager.getConnection("jdbc:mysql://localhost:3306/your_database_name", "your_username", "your_password");
            st = cn.createStatement();
            st.executeUpdate("create table student");
            ResultSet rs = st.executeQuery("select * from student");
            while(rs.next()){
                System.out.println(rs.getString(1) + " " + rs.getString(2));
            }
        }
    }
}