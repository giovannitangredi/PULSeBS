import React, { useEffect, useState } from 'react'
import echarts from 'echarts';
import { Button, ButtonGroup } from 'react-bootstrap';

const option = {
    legend: {},
    tooltip: {},
    dataset: {
        source: [
            ['product', '2015', '2016', '2017'],
            ['Matcha Latte', 43.3, 85.8, 93.7],
            ['Milk Tea', 83.1, 73.4, 55.1],
            ['Cheese Cocoa', 86.4, 65.2, 82.5]
        ]
    },
    xAxis: { type: 'category' },
    yAxis: {},
    // Declare several bar series, each will be mapped
    // to a column of dataset.source by default.
    series: [
        { type: 'bar' },
        { type: 'bar' }
    ]
}

export const StaticCharts = (props) => {
    const { bookedLectures, monthLectures } = props.data
    const [time, setTime] = useState('week')
    const [course, setCourse] = useState(props.course_list.length && props.course_list[0].id || '')
    // console.log(props.data)
    useEffect(() => {
        const element = document.getElementById('instance')
        const chart = echarts.init(element)
        const course_id = course === '' ? props.course_list.length && props.course_list[0].id : course
        const data = time === 'week' ?
            bookedLectures.filter(item => item.course_id === Number(course_id)).map(item => [item.week, item.booking, item.attendances]) :
            monthLectures.filter(item => item.course_id === Number(course_id)).map(item => [item.month, item.booking, item.attendances])
        option.dataset.source = [
            ['product', 'booking', 'attendances'],
            ...data
        ]
        // console.log(option)
        chart.setOption(option)
    }, [props.data, time, course])

    return <>
        <ButtonGroup>
            <Button variant="secondary" onClick={() => setTime('week')}>Week</Button>
            <Button variant="secondary" onClick={() => setTime('month')}>Month</Button>
        </ButtonGroup>

        <ButtonGroup>
            {
                props.course_list.map(item => <Button key={item.id} variant="secondary" onClick={() => setCourse(item.id)}>{item.name}</Button>)
            }
        </ButtonGroup>
        <div id='instance' style={{ width: '100%', height: 400 }} />
    </>
}
