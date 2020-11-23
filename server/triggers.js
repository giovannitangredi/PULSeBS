exports.booking_trigger = 
    `CREATE TRIGGER IF NOT EXISTS booking AFTER INSERT ON lecture_booking
    BEGIN
        DELETE FROM _Variables;
        INSERT INTO _Variables(name, int_value, date_value, string_value) 
            SELECT 'lecture', id, DATE(start), name 
            FROM lecture 
            WHERE id = NEW.lecture_id;
            
        INSERT INTO _Variables(name, int_value, string_value) 
            SELECT 'course', course.id, course.name 
            FROM lecture, course 
            WHERE lecture.course = course.id AND lecture.id = NEW.lecture_id;

        INSERT INTO stats_time(date, week, month, year) 
            SELECT date_value, strftime('%Y-%W', date_value), strftime('%Y-%m', date_value), strftime('%Y', date_value) 
            FROM _Variables 
            WHERE name = 'lecture' 
            AND NOT EXISTS (
            SELECT * 
            FROM stats_time 
            WHERE date = (SELECT date_value FROM _Variables WHERE name = 'lecture')
            );
        
        INSERT INTO stats_lecture(lecture_id, lecture_name, course_id, course_name) 
            SELECT l.int_value, l.string_value , c.int_value, c.string_value
            FROM _Variables l, _Variables c 
            WHERE l.name = 'lecture' AND c.name = 'course' 
            AND NOT EXISTS (
            SELECT * 
            FROM stats_lecture 
            WHERE lecture_id = NEW.lecture_id
            );

        INSERT INTO _Variables(name, int_value) VALUES ('tid', (SELECT tid FROM stats_time WHERE date = (SELECT date_value FROM _Variables WHERE name = 'lecture')));
        INSERT INTO _Variables(name, int_value) VALUES ('lid', (SELECT lid FROM stats_lecture WHERE lecture_id = NEW.lecture_id));

        INSERT INTO stats_usage(tid, lid, booking, cancellations, attendance) 
            SELECT t.int_value, l.int_value, 0, 0, 0
            FROM _Variables t, _Variables l
            WHERE t.name = 'tid'
            AND l.name = 'lid'
            AND NOT EXISTS (
            SELECT * 
            FROM stats_usage 
            WHERE lid = (SELECT int_value FROM _Variables WHERE name = 'lid')
            AND tid = (SELECT int_value FROM _Variables WHERE name = 'tid')
            );
        
        UPDATE stats_usage 
        SET booking = booking + 1, attendance = attendance + 1  
            WHERE lid = (SELECT int_value FROM _Variables WHERE name = 'lid')
            AND tid = (SELECT int_value FROM _Variables WHERE name = 'tid');
    
    END;`;

exports.cancellation_trigger = 
    `CREATE TRIGGER IF NOT EXISTS cancellation AFTER DELETE ON lecture_booking
    BEGIN
        DELETE FROM _Variables;
        INSERT INTO _Variables(name, int_value, date_value, string_value) 
            SELECT 'lecture', id, DATE(start), name 
            FROM lecture 
            WHERE id = OLD.lecture_id;


        INSERT INTO _Variables(name, int_value) VALUES ('tid', (SELECT tid FROM stats_time WHERE date = (SELECT date_value FROM _Variables WHERE name = 'lecture')));
        INSERT INTO _Variables(name, int_value) VALUES ('lid', (SELECT lid FROM stats_lecture WHERE lecture_id = OLD.lecture_id));

        UPDATE stats_usage 
        SET cancellations = cancellations + 1, attendance = attendance - 1  
            WHERE lid = (SELECT int_value FROM _Variables WHERE name = 'lid')
            AND tid = (SELECT int_value FROM _Variables WHERE name = 'tid');

    END;`;