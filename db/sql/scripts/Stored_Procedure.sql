USE MESOCYCLE_PLANNER
  
delimiter $$

create procedure AddCustomExercise (
  in CustomID int
  in EquipmentID int
  in MuscleGroupID int
  in UserID int
  in Exercisename varchar(150)
)
begin
  insert into exercise values(CustomID, EquipmentID, MuscleGroupID, UserID, Exercisename);
end $$
  
delimiter ;
