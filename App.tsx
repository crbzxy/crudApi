import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, Text, TouchableOpacity, RefreshControl, Modal, Button } from 'react-native';

interface User {
  id: number;
  name: string;
  email: string;
}

const UserItem = ({ item, onDelete }: { item: User, onDelete: (id: number) => void }) => (
  <View style={styles.item}>
    <Text style={styles.title}>{item.name}</Text>
    <Text>{item.email}</Text>
    <TouchableOpacity onPress={() => onDelete(item.id)}>
      <Text style={styles.deleteButton}>Eliminar</Text>
    </TouchableOpacity>
  </View>
);

const App = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://192.168.68.124:8080/api/users');
      const data = await response.json();
      setUsers(data);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setRefreshing(false);
    }
  };

  const createUser = async () => {
    const newUser: User = {
      name: newUserName,
      email: newUserEmail
    };
  
    try {
      const response = await fetch('http://192.168.68.124:8080/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });
      const data = await response.json();
      setUsers([...users, data]);
      setModalVisible(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };
  

  const deleteUser = async (id: number) => {
    try {
      await fetch(`http://192.168.68.124:8080/api/users/${id}`, {
        method: 'DELETE',
      });
      const updatedUsers = users.filter(user => user.id !== id);
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const onChangeSearch = (query: string) => setSearchQuery(query);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const filteredUsers = searchQuery ? users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : users;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchbar}
        placeholder="Buscar usuario"
        onChangeText={onChangeSearch}
        value={searchQuery}
      />
      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <UserItem item={item} onDelete={deleteUser} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text style={styles.addButton}>Agregar Usuario</Text>
      </TouchableOpacity>

      {/* Modal para crear un nuevo usuario */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              onChangeText={text => setNewUserName(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              onChangeText={text => setNewUserEmail(text)}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ flex: 1, margin: 8 }}>
                <Button
                  title="Cancelar"
                  onPress={() => setModalVisible(false)}
                  color="red"
                />
              </View>
              <View style={{ flex: 1, margin: 8 }}>
                <Button
                  title="Crear"
                  onPress={createUser}
                  color="green"
                />
              </View>
            </View>



          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  searchbar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  item: {
    backgroundColor: '#00000d',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
  },
  title: {
    fontSize: 18,
  },
  deleteButton: {
    color: 'red',
    marginTop: 5,
  },
  addButton: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    marginBottom: 30,
    backgroundColor: 'rgb(9, 0, 0)',
    padding: 10,
    borderRadius: 5,

  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(225,225,210, 0.5)',
  },
  modalContent: {
    backgroundColor: 'rgb(9, 0, 0)',
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
    display: 'flex',
    justifyContent: 'space-between',
    alignSelf: 'center',
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  Button: {
    margin: 10,
  }

});

export default App;
