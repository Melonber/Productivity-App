import React from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatisticsContainer = styled.div`
  background: linear-gradient(to bottom, #2a3f5a 0%, #1b2838 100%);
  border-radius: 5px;
  padding: 20px;
  margin-top: 30px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
`;

const SectionTitle = styled.h2`
  color: #fff;
  margin-bottom: 20px;
  font-size: 22px;
  border-bottom: 1px solid #3d556e;
  padding-bottom: 10px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: rgba(42, 63, 90, 0.5);
  border-radius: 5px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

const StatTitle = styled.h3`
  color: #66c0f4;
  font-size: 16px;
  margin-bottom: 10px;
`;

const StatValue = styled.p`
  color: #fff;
  font-size: 24px;
  font-weight: bold;
`;

const TimeValue = styled(StatValue)`
  color: #a1cd44;
`;

const ChartContainer = styled.div`
  height: 300px;
  margin-top: 20px;
  background: rgba(27, 40, 56, 0.7);
  border-radius: 5px;
  padding: 15px;
`;

const formatHours = (seconds) => {
  return (seconds / 3600).toFixed(1);
};

const getLast24HoursData = (tasks) => {
  const now = Date.now();
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
  
  return tasks.map(task => {
    // This is simplified - in a real app you'd track individual sessions
    const recentActivity = task.timeUpdated > twentyFourHoursAgo;
    return {
      ...task,
      recentActivity
    };
  });
};

const Statistics = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <StatisticsContainer>
        <SectionTitle>Statistics</SectionTitle>
        <p>No data available yet. Start tracking your tasks to see statistics.</p>
      </StatisticsContainer>
    );
  }

  // Prepare data for charts and statistics
  const totalTime = tasks.reduce((sum, task) => sum + task.timeSpent, 0);
  const topTaskAllTime = [...tasks].sort((a, b) => b.timeSpent - a.timeSpent)[0];
  
  const last24HoursTasks = getLast24HoursData(tasks);
  const topTask24Hours = [...last24HoursTasks]
    .filter(task => task.recentActivity)
    .sort((a, b) => b.timeSpent - a.timeSpent)[0];
  
  const averagePerTask = totalTime / tasks.length;
  
  // Prepare chart data
  const chartData = tasks
    .filter(task => task.timeSpent > 0)
    .sort((a, b) => b.timeSpent - a.timeSpent)
    .slice(0, 8)
    .map(task => ({
      name: task.title.length > 15 ? task.title.substring(0, 15) + '...' : task.title,
      time: parseFloat((task.timeSpent / 3600).toFixed(1)),
      color: '#66c0f4'
    }));

  return (
    <StatisticsContainer>
      <SectionTitle>Your Productivity Statistics</SectionTitle>
      
      <StatsGrid>
        <StatCard>
          <StatTitle>Total Tracked Time</StatTitle>
          <TimeValue>{formatHours(totalTime)} hours</TimeValue>
        </StatCard>
        
        <StatCard>
          <StatTitle>Top Activity (All Time)</StatTitle>
          <StatValue>{topTaskAllTime?.title || 'N/A'}</StatValue>
          <TimeValue>{formatHours(topTaskAllTime?.timeSpent || 0)} hours</TimeValue>
        </StatCard>
        
        <StatCard>
          <StatTitle>Top Activity (Last 24h)</StatTitle>
          <StatValue>{topTask24Hours?.title || 'N/A'}</StatValue>
          <TimeValue>{formatHours(topTask24Hours?.timeSpent || 0)} hours</TimeValue>
        </StatCard>
        
        <StatCard>
          <StatTitle>Average per Task</StatTitle>
          <TimeValue>{formatHours(averagePerTask)} hours</TimeValue>
        </StatCard>
      </StatsGrid>
      
      <SectionTitle>Time Distribution</SectionTitle>
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3d556e" />
            <XAxis dataKey="name" stroke="#c6d4df" />
            <YAxis stroke="#c6d4df" unit="h" />
            <Tooltip 
              contentStyle={{
                background: '#2a3f5a',
                borderColor: '#3d556e',
                borderRadius: '5px',
                color: '#fff'
              }}
              formatter={(value) => [`${value} hours`, 'Time spent']}
            />
            <Bar dataKey="time" fill="#66c0f4" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </StatisticsContainer>
  );
};

export default Statistics;