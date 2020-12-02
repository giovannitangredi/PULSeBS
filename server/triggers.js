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
            SELECT date_value, strftime('%Y-', date_value) || (strftime('%W', date_value)+1), strftime('%Y-%m', date_value), strftime('%Y', date_value) 
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
    WHEN 'on' = (SELECT trigger_status FROM _Trigger WHERE name = 'cancellation_trigger')
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

exports.convert_trigger = 
    `CREATE TRIGGER IF NOT EXISTS convert AFTER UPDATE OF status ON lecture
    WHEN NEW.status = 'distance' 
    BEGIN
    DELETE FROM _Variables;

    UPDATE _Trigger
        SET trigger_status = 'off'
        WHERE name = 'cancellation_trigger';

    INSERT INTO _Variables(name, int_value) 
        SELECT 'lecture', count(*)
        FROM lecture_booking
        WHERE lecture_id = OLD.id;

    DELETE FROM lecture_booking
        WHERE lecture_id = OLD.id;
       
    INSERT INTO _Variables(name, int_value) VALUES ('lid', (SELECT lid FROM stats_lecture WHERE lecture_id = OLD.id));

    UPDATE stats_usage 
        SET booking = 0, cancellations = cancellations + (SELECT int_value FROM _Variables WHERE name = 'lecture'), attendance = 0 
        WHERE lid = (SELECT int_value FROM _Variables WHERE name = 'lid');
    
    UPDATE _Trigger
        SET trigger_status = 'on'
        WHERE name = 'cancellation_trigger';
    END;`;

    exports.deleteLecture_trigger = 
    `CREATE TRIGGER IF NOT EXISTS deleteLecture BEFORE DELETE ON lecture
    BEGIN
    DELETE FROM _Variables;

    UPDATE _Trigger
        SET trigger_status = 'off'
        WHERE name = 'cancellation_trigger';

    DELETE FROM lecture_booking
        WHERE lecture_id = OLD.id;
    
    INSERT INTO _Variables(name,int_value) VALUES('lid', (SELECT lid FROM stats_lecture WHERE lecture_id = OLD.id));

    DELETE FROM stats_usage
        WHERE lid = (SELECT int_value FROM _Variables WHERE name = 'lid');   

    DELETE FROM stats_lecture
        WHERE lecture_id = OLD.id;
    
    UPDATE _Trigger
        SET trigger_status = 'on'
        WHERE name = 'cancellation_trigger';
    END;`;